#[allow(duplicate_alias, lint(self_transfer))]
module gaminglootbox::lootbox {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::dynamic_field as df;
    use sui::random::{Self, Random};
    use sui::package;
    use sui::display;

    // === Error Codes ===
    const EInsufficientPayment: u64 = 1;
    const EWeightsMustSumTo100: u64 = 2;
    const EGameIsPaused: u64 = 3;
    const EInvalidPrice: u64 = 4;
    const EZeroWithdrawAmount: u64 = 5;
    const EInsufficientTreasuryBalance: u64 = 6;
    const EInvalidWeightRange: u64 = 7;

    // === Rarity Constants ===
    const RARITY_COMMON: u8 = 0;
    const RARITY_RARE: u8 = 1;
    const RARITY_EPIC: u8 = 2;
    const RARITY_LEGENDARY: u8 = 3;

    // === Default Configuration ===
    const DEFAULT_COMMON_WEIGHT: u64 = 60;
    const DEFAULT_RARE_WEIGHT: u64 = 25;
    const DEFAULT_EPIC_WEIGHT: u64 = 12;
    const DEFAULT_LEGENDARY_WEIGHT: u64 = 3;
    const DEFAULT_BOX_PRICE: u64 = 100_000_000; // 0.1 SUI in MIST
    const DEFAULT_PITY_THRESHOLD: u64 = 30; // Guaranteed Legendary on 30 consecutive non-legendary opens

    // === One-Time Witness ===
    public struct LOOTBOX has drop {}

    // === Capabilities & Game State ===

    /// Admin capability granting privileged administrative operations
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared Game Configuration object storing economy and loot parameters
    public struct GameConfig has key {
        id: UID,
        common_weight: u64,
        rare_weight: u64,
        epic_weight: u64,
        legendary_weight: u64,
        box_price: u64,
        pity_threshold: u64,
        treasury: Balance<SUI>,
        total_boxes_purchased: u64,
        total_boxes_opened: u64,
        total_items_minted: u64,
        is_paused: bool,
    }

    /// Owned Loot Box mystery container object
    public struct LootBox has key, store {
        id: UID,
        serial_number: u64,
        purchased_at_epoch: u64,
        purchased_by: address,
    }

    /// Owned Game Item NFT minted from loot box outcome
    public struct GameItem has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        rarity: u8,
        power: u64,
        serial_number: u64,
        minted_at_epoch: u64,
        original_owner: address,
    }

    /// Dynamic field record tracking user pity counter
    public struct PityTracker has store {
        counter: u64,
        total_opened: u64,
        legendary_count: u64,
    }

    // === Events ===

    public struct LootBoxPurchased has copy, drop {
        lootbox_id: ID,
        purchaser: address,
        price: u64,
        serial_number: u64,
    }

    public struct LootBoxOpened has copy, drop {
        item_id: ID,
        recipient: address,
        rarity: u8,
        power: u64,
        serial_number: u64,
        lootbox_serial: u64,
        pity_triggered: bool,
        pity_counter_after: u64,
    }

    public struct ItemTransferred has copy, drop {
        item_id: ID,
        from: address,
        to: address,
        serial_number: u64,
    }

    public struct ItemBurned has copy, drop {
        item_id: ID,
        burner: address,
        rarity: u8,
        power: u64,
        serial_number: u64,
    }

    public struct RarityWeightsUpdated has copy, drop {
        common_weight: u64,
        rare_weight: u64,
        epic_weight: u64,
        legendary_weight: u64,
    }

    public struct PriceUpdated has copy, drop {
        old_price: u64,
        new_price: u64,
    }

    public struct TreasuryWithdrawn has copy, drop {
        recipient: address,
        amount: u64,
    }

    public struct GamePauseStateChanged has copy, drop {
        is_paused: bool,
    }

    // === Module Initializer ===

    fun init(otw: LOOTBOX, ctx: &mut TxContext) {
        // Create AdminCap and send to module publisher
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(admin_cap, ctx.sender());

        // Initialize and share GameConfig
        let game_config = GameConfig {
            id: object::new(ctx),
            common_weight: DEFAULT_COMMON_WEIGHT,
            rare_weight: DEFAULT_RARE_WEIGHT,
            epic_weight: DEFAULT_EPIC_WEIGHT,
            legendary_weight: DEFAULT_LEGENDARY_WEIGHT,
            box_price: DEFAULT_BOX_PRICE,
            pity_threshold: DEFAULT_PITY_THRESHOLD,
            treasury: balance::zero<SUI>(),
            total_boxes_purchased: 0,
            total_boxes_opened: 0,
            total_items_minted: 0,
            is_paused: false,
        };
        transfer::share_object(game_config);

        // Setup Sui Object Display standard for GameItem NFT
        let publisher = package::claim(otw, ctx);
        let mut item_display = display::new<GameItem>(&publisher, ctx);

        display::add(&mut item_display, string::utf8(b"name"), string::utf8(b"{name} #{serial_number}"));
        display::add(&mut item_display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut item_display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut item_display, string::utf8(b"rarity_tier"), string::utf8(b"{rarity}"));
        display::add(&mut item_display, string::utf8(b"power_level"), string::utf8(b"{power}"));
        display::add(&mut item_display, string::utf8(b"project_url"), string::utf8(b"https://gaminglootbox.sui"));
        display::add(&mut item_display, string::utf8(b"creator"), string::utf8(b"Sui LootBox Gaming"));
        display::update_version(&mut item_display);

        // Setup Display standard for LootBox container
        let mut box_display = display::new<LootBox>(&publisher, ctx);
        display::add(&mut box_display, string::utf8(b"name"), string::utf8(b"Mystery Loot Box #{serial_number}"));
        display::add(&mut box_display, string::utf8(b"description"), string::utf8(b"An unopened mystery gaming loot box backed by Sui on-chain verifiable randomness."));
        display::add(&mut box_display, string::utf8(b"image_url"), string::utf8(b"https://assets.gaminglootbox.sui/lootbox.png"));
        display::update_version(&mut box_display);

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(item_display, ctx.sender());
        transfer::public_transfer(box_display, ctx.sender());
    }

    // === Core Player Functions ===

    /// Purchases an unopened mystery loot box using SUI tokens
    public fun purchase_loot_box(
        config: &mut GameConfig,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext,
    ): LootBox {
        assert!(!config.is_paused, EGameIsPaused);
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= config.box_price, EInsufficientPayment);

        // Deduct price into treasury
        let paid_coin = coin::split(&mut payment, config.box_price, ctx);
        balance::join(&mut config.treasury, coin::into_balance(paid_coin));

        // Refund any excess payment to sender
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, ctx.sender());
        } else {
            coin::destroy_zero(payment);
        };

        config.total_boxes_purchased = config.total_boxes_purchased + 1;
        let serial = config.total_boxes_purchased;

        let box_obj = LootBox {
            id: object::new(ctx),
            serial_number: serial,
            purchased_at_epoch: tx_context::epoch(ctx),
            purchased_by: ctx.sender(),
        };

        event::emit(LootBoxPurchased {
            lootbox_id: object::id(&box_obj),
            purchaser: ctx.sender(),
            price: config.box_price,
            serial_number: serial,
        });

        box_obj
    }

    /// Entry point for purchasing a loot box and receiving it directly
    public entry fun buy_loot_box_entry(
        config: &mut GameConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let box_obj = purchase_loot_box(config, payment, ctx);
        transfer::public_transfer(box_obj, ctx.sender());
    }

    /// Opens an owned LootBox using Sui's native cryptographically verifiable randomness.
    /// MUST be private entry function to protect against composability & rollback attacks!
    entry fun open_loot_box(
        config: &mut GameConfig,
        lootbox: LootBox,
        r: &Random,
        ctx: &mut TxContext,
    ) {
        assert!(!config.is_paused, EGameIsPaused);
        let sender = ctx.sender();

        // Burn the loot box object
        let LootBox {
            id: box_id,
            serial_number: box_serial,
            purchased_at_epoch: _,
            purchased_by: _,
        } = lootbox;
        object::delete(box_id);

        // Fetch or initialize user's Dynamic Field Pity Tracker
        let (pity_counter_before, total_opened_before, legendary_count_before) = if (df::exists_with_type<address, PityTracker>(&config.id, sender)) {
            let tracker = df::borrow<address, PityTracker>(&config.id, sender);
            (tracker.counter, tracker.total_opened, tracker.legendary_count)
        } else {
            (0, 0, 0)
        };

        // Instantiate secure random generator locally (never pass as argument)
        let mut gen = random::new_generator(r, ctx);

        let (rarity, power, pity_triggered) = if (pity_counter_before >= config.pity_threshold) {
            // Pity System Triggered: Guarantee Legendary!
            let pw = random::generate_u64_in_range(&mut gen, 41, 50);
            (RARITY_LEGENDARY, pw, true)
        } else {
            // Roll a random number 0-99 (Weights sum to 100)
            let roll = (random::generate_u8_in_range(&mut gen, 0, 99) as u64);
            let common_threshold = config.common_weight;
            let rare_threshold = common_threshold + config.rare_weight;
            let epic_threshold = rare_threshold + config.epic_weight;

            if (roll < common_threshold) {
                let pw = random::generate_u64_in_range(&mut gen, 1, 10);
                (RARITY_COMMON, pw, false)
            } else if (roll < rare_threshold) {
                let pw = random::generate_u64_in_range(&mut gen, 11, 25);
                (RARITY_RARE, pw, false)
            } else if (roll < epic_threshold) {
                let pw = random::generate_u64_in_range(&mut gen, 26, 40);
                (RARITY_EPIC, pw, false)
            } else {
                let pw = random::generate_u64_in_range(&mut gen, 41, 50);
                (RARITY_LEGENDARY, pw, false)
            }
        };

        // Update Dynamic Field Pity Tracker state
        let (new_counter, new_legendary_count) = if (rarity == RARITY_LEGENDARY) {
            (0, legendary_count_before + 1)
        } else {
            (pity_counter_before + 1, legendary_count_before)
        };

        if (df::exists_with_type<address, PityTracker>(&config.id, sender)) {
            let tracker_mut = df::borrow_mut<address, PityTracker>(&mut config.id, sender);
            tracker_mut.counter = new_counter;
            tracker_mut.total_opened = total_opened_before + 1;
            tracker_mut.legendary_count = new_legendary_count;
        } else {
            df::add(&mut config.id, sender, PityTracker {
                counter: new_counter,
                total_opened: total_opened_before + 1,
                legendary_count: new_legendary_count,
            });
        };

        // Update game configuration global metrics
        config.total_boxes_opened = config.total_boxes_opened + 1;
        config.total_items_minted = config.total_items_minted + 1;
        let item_serial = config.total_items_minted;

        // Determine item metadata & asset imagery based on outcome
        let item_name_index = random::generate_u8_in_range(&mut gen, 0, 2);
        let (name, description, image_url) = generate_item_metadata(rarity, item_name_index);

        // Mint unique GameItem NFT
        let item = GameItem {
            id: object::new(ctx),
            name,
            description,
            image_url,
            rarity,
            power,
            serial_number: item_serial,
            minted_at_epoch: tx_context::epoch(ctx),
            original_owner: sender,
        };

        event::emit(LootBoxOpened {
            item_id: object::id(&item),
            recipient: sender,
            rarity,
            power,
            serial_number: item_serial,
            lootbox_serial: box_serial,
            pity_triggered,
            pity_counter_after: new_counter,
        });

        // Transfer newly minted GameItem NFT directly to sender
        transfer::public_transfer(item, sender);
    }

    // === Item Lifecycle & Operations ===

    /// Returns item's name, rarity tier, power level, and serial number
    public fun get_item_stats(item: &GameItem): (String, u8, u64, u64) {
        (item.name, item.rarity, item.power, item.serial_number)
    }

    /// Allows owner to safely transfer a GameItem NFT to another address
    public fun transfer_item(item: GameItem, recipient: address, ctx: &mut TxContext) {
        let item_id = object::id(&item);
        let serial = item.serial_number;
        let sender = ctx.sender();

        event::emit(ItemTransferred {
            item_id,
            from: sender,
            to: recipient,
            serial_number: serial,
        });

        transfer::public_transfer(item, recipient);
    }

    /// Destroys/burns an unwanted GameItem NFT
    public fun burn_item(item: GameItem, ctx: &mut TxContext) {
        let GameItem {
            id,
            name: _,
            description: _,
            image_url: _,
            rarity,
            power,
            serial_number,
            minted_at_epoch: _,
            original_owner: _,
        } = item;

        let item_id = object::uid_to_inner(&id);
        object::delete(id);

        event::emit(ItemBurned {
            item_id,
            burner: ctx.sender(),
            rarity,
            power,
            serial_number,
        });
    }

    // === Admin Functions ===

    /// Admin can adjust drop rates. Weights must sum to 100. Requires AdminCap.
    public fun update_rarity_weights(
        _: &AdminCap,
        config: &mut GameConfig,
        common: u64,
        rare: u64,
        epic: u64,
        legendary: u64,
    ) {
        assert!(common + rare + epic + legendary == 100, EWeightsMustSumTo100);
        assert!(common > 0 && rare > 0 && epic > 0 && legendary > 0, EInvalidWeightRange);

        config.common_weight = common;
        config.rare_weight = rare;
        config.epic_weight = epic;
        config.legendary_weight = legendary;

        event::emit(RarityWeightsUpdated {
            common_weight: common,
            rare_weight: rare,
            epic_weight: epic,
            legendary_weight: legendary,
        });
    }

    /// Admin can update the price per loot box. Requires AdminCap.
    public fun update_price(
        _: &AdminCap,
        config: &mut GameConfig,
        new_price: u64,
    ) {
        assert!(new_price > 0, EInvalidPrice);
        let old_price = config.box_price;
        config.box_price = new_price;

        event::emit(PriceUpdated {
            old_price,
            new_price,
        });
    }

    /// Admin can update pity threshold. Requires AdminCap.
    public fun update_pity_threshold(
        _: &AdminCap,
        config: &mut GameConfig,
        new_threshold: u64,
    ) {
        assert!(new_threshold > 0, EInvalidWeightRange);
        config.pity_threshold = new_threshold;
    }

    /// Admin can withdraw accumulated SUI treasury balance. Requires AdminCap.
    public fun withdraw_treasury(
        _: &AdminCap,
        config: &mut GameConfig,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        assert!(amount > 0, EZeroWithdrawAmount);
        assert!(balance::value(&config.treasury) >= amount, EInsufficientTreasuryBalance);

        let coin_to_send = coin::from_balance(balance::split(&mut config.treasury, amount), ctx);
        transfer::public_transfer(coin_to_send, recipient);

        event::emit(TreasuryWithdrawn {
            recipient,
            amount,
        });
    }

    /// Emergency pause/unpause switch for game safety. Requires AdminCap.
    public fun set_paused(
        _: &AdminCap,
        config: &mut GameConfig,
        paused: bool,
    ) {
        config.is_paused = paused;
        event::emit(GamePauseStateChanged {
            is_paused: paused,
        });
    }

    // === View / Helper Functions ===

    public fun get_pity_count(config: &GameConfig, player: address): u64 {
        if (df::exists_with_type<address, PityTracker>(&config.id, player)) {
            df::borrow<address, PityTracker>(&config.id, player).counter
        } else {
            0
        }
    }

    public fun get_pity_stats(config: &GameConfig, player: address): (u64, u64, u64) {
        if (df::exists_with_type<address, PityTracker>(&config.id, player)) {
            let t = df::borrow<address, PityTracker>(&config.id, player);
            (t.counter, t.total_opened, t.legendary_count)
        } else {
            (0, 0, 0)
        }
    }

    public fun get_rarity_weights(config: &GameConfig): (u64, u64, u64, u64) {
        (config.common_weight, config.rare_weight, config.epic_weight, config.legendary_weight)
    }

    public fun get_box_price(config: &GameConfig): u64 {
        config.box_price
    }

    public fun get_pity_threshold(config: &GameConfig): u64 {
        config.pity_threshold
    }

    public fun get_treasury_balance(config: &GameConfig): u64 {
        balance::value(&config.treasury)
    }

    public fun get_game_stats(config: &GameConfig): (u64, u64, u64, bool) {
        (
            config.total_boxes_purchased,
            config.total_boxes_opened,
            config.total_items_minted,
            config.is_paused,
        )
    }

    public fun item_name(item: &GameItem): String { item.name }
    public fun item_rarity(item: &GameItem): u8 { item.rarity }
    public fun item_power(item: &GameItem): u64 { item.power }
    public fun item_serial_number(item: &GameItem): u64 { item.serial_number }
    public fun item_image_url(item: &GameItem): String { item.image_url }
    public fun item_description(item: &GameItem): String { item.description }
    public fun item_original_owner(item: &GameItem): address { item.original_owner }

    // === Internal Helper Functions ===

    fun generate_item_metadata(rarity: u8, variant: u8): (String, String, String) {
        if (rarity == RARITY_COMMON) {
            let name = if (variant == 0) {
                string::utf8(b"Rusty Iron Blade")
            } else if (variant == 1) {
                string::utf8(b"Novice Wooden Wand")
            } else {
                string::utf8(b"Reinforced Buckler")
            };
            let desc = string::utf8(b"A humble beginner equipment with reliable utility on the battlefield.");
            let img = string::utf8(b"https://assets.gaminglootbox.sui/items/common.png");
            (name, desc, img)
        } else if (rarity == RARITY_RARE) {
            let name = if (variant == 0) {
                string::utf8(b"Frostforged Longsword")
            } else if (variant == 1) {
                string::utf8(b"Arcane Spellblade")
            } else {
                string::utf8(b"Shadowstride Cloak")
            };
            let desc = string::utf8(b"An enchanted weapon radiating arcane energy and battle-tested fortitude.");
            let img = string::utf8(b"https://assets.gaminglootbox.sui/items/rare.png");
            (name, desc, img)
        } else if (rarity == RARITY_EPIC) {
            let name = if (variant == 0) {
                string::utf8(b"Dragonflame Glaive")
            } else if (variant == 1) {
                string::utf8(b"Celestial Aegis Shield")
            } else {
                string::utf8(b"Voidwalker Staff")
            };
            let desc = string::utf8(b"An ancient heirloom pulsing with catastrophic destructive power.");
            let img = string::utf8(b"https://assets.gaminglootbox.sui/items/epic.png");
            (name, desc, img)
        } else {
            // RARITY_LEGENDARY
            let name = if (variant == 0) {
                string::utf8(b"Aethelgard World-Breaker")
            } else if (variant == 1) {
                string::utf8(b"Crown of Immortal Dominion")
            } else {
                string::utf8(b"Omniscience Soulreaver")
            };
            let desc = string::utf8(b"A mythical artifact imbued with celestial divinity and supreme dominance.");
            let img = string::utf8(b"https://assets.gaminglootbox.sui/items/legendary.png");
            (name, desc, img)
        }
    }

    // === Test-Only Helper Functions ===

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let otw = LOOTBOX {};
        init(otw, ctx);
    }

    #[test_only]
    public fun open_loot_box_deterministic_for_testing(
        config: &mut GameConfig,
        lootbox: LootBox,
        mock_roll: u64,
        mock_power: u64,
        ctx: &mut TxContext,
    ): GameItem {
        assert!(!config.is_paused, EGameIsPaused);
        let sender = ctx.sender();

        let LootBox {
            id: box_id,
            serial_number: box_serial,
            purchased_at_epoch: _,
            purchased_by: _,
        } = lootbox;
        object::delete(box_id);

        let (pity_counter_before, total_opened_before, legendary_count_before) = if (df::exists_with_type<address, PityTracker>(&config.id, sender)) {
            let tracker = df::borrow<address, PityTracker>(&config.id, sender);
            (tracker.counter, tracker.total_opened, tracker.legendary_count)
        } else {
            (0, 0, 0)
        };

        let (rarity, power, pity_triggered) = if (pity_counter_before >= config.pity_threshold) {
            (RARITY_LEGENDARY, mock_power, true)
        } else {
            let common_threshold = config.common_weight;
            let rare_threshold = common_threshold + config.rare_weight;
            let epic_threshold = rare_threshold + config.epic_weight;

            if (mock_roll < common_threshold) {
                (RARITY_COMMON, mock_power, false)
            } else if (mock_roll < rare_threshold) {
                (RARITY_RARE, mock_power, false)
            } else if (mock_roll < epic_threshold) {
                (RARITY_EPIC, mock_power, false)
            } else {
                (RARITY_LEGENDARY, mock_power, false)
            }
        };

        let (new_counter, new_legendary_count) = if (rarity == RARITY_LEGENDARY) {
            (0, legendary_count_before + 1)
        } else {
            (pity_counter_before + 1, legendary_count_before)
        };

        if (df::exists_with_type<address, PityTracker>(&config.id, sender)) {
            let tracker_mut = df::borrow_mut<address, PityTracker>(&mut config.id, sender);
            tracker_mut.counter = new_counter;
            tracker_mut.total_opened = total_opened_before + 1;
            tracker_mut.legendary_count = new_legendary_count;
        } else {
            df::add(&mut config.id, sender, PityTracker {
                counter: new_counter,
                total_opened: total_opened_before + 1,
                legendary_count: new_legendary_count,
            });
        };

        config.total_boxes_opened = config.total_boxes_opened + 1;
        config.total_items_minted = config.total_items_minted + 1;
        let item_serial = config.total_items_minted;

        let (name, description, image_url) = generate_item_metadata(rarity, 0);

        let item = GameItem {
            id: object::new(ctx),
            name,
            description,
            image_url,
            rarity,
            power,
            serial_number: item_serial,
            minted_at_epoch: tx_context::epoch(ctx),
            original_owner: sender,
        };

        event::emit(LootBoxOpened {
            item_id: object::id(&item),
            recipient: sender,
            rarity,
            power,
            serial_number: item_serial,
            lootbox_serial: box_serial,
            pity_triggered,
            pity_counter_after: new_counter,
        });

        item
    }

    #[test_only]
    public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap {
            id: object::new(ctx),
        }
    }

    #[test_only]
    public fun destroy_admin_cap_for_testing(cap: AdminCap) {
        let AdminCap { id } = cap;
        object::delete(id);
    }
}
