#[test_only]
#[allow(unused_use, unused_const, duplicate_alias)]
module gaminglootbox::lootbox_tests {
    use sui::test_scenario::{Self as ts};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string;
    use gaminglootbox::lootbox::{
        Self,
        GameConfig,
        LootBox,
        GameItem,
        AdminCap,
        init_for_testing,
        open_loot_box_deterministic_for_testing
    };

    // === Test Addresses ===
    const ADMIN: address = @0xAD111;
    const ALICE: address = @0xAAA1;
    const BOB: address = @0xBBB2;

    #[test]
    fun test_game_initialization() {
        let mut scenario = ts::begin(ADMIN);

        // Run module initializer
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // Advance epoch to process transfers and shared objects
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Verify AdminCap is received by ADMIN
            assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 0);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            ts::return_to_sender(&scenario, admin_cap);

            // Verify GameConfig is shared
            let config = ts::take_shared<GameConfig>(&scenario);
            let (common, rare, epic, leg) = lootbox::get_rarity_weights(&config);
            assert!(common == 60, 1);
            assert!(rare == 25, 2);
            assert!(epic == 12, 3);
            assert!(leg == 3, 4);
            assert!(lootbox::get_box_price(&config) == 100_000_000, 5); // 0.1 SUI
            assert!(lootbox::get_treasury_balance(&config) == 0, 6);
            assert!(lootbox::get_pity_threshold(&config) == 30, 7);

            let (purchased, opened, minted, paused) = lootbox::get_game_stats(&config);
            assert!(purchased == 0 && opened == 0 && minted == 0 && !paused, 8);

            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_purchase_loot_box_with_exact_and_excess_payment() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // ALICE purchases a box with exact payment (0.1 SUI)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));

            let box1 = lootbox::purchase_loot_box(&mut config, payment, ts::ctx(&mut scenario));
            assert!(lootbox::get_treasury_balance(&config) == 100_000_000, 10);

            let (purchased, _, _, _) = lootbox::get_game_stats(&config);
            assert!(purchased == 1, 11);

            sui::transfer::public_transfer(box1, ALICE);
            ts::return_shared(config);
        };

        // ALICE purchases a second box with excess payment (0.25 SUI) -> 0.15 SUI refund
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(250_000_000, ts::ctx(&mut scenario));

            let box2 = lootbox::purchase_loot_box(&mut config, payment, ts::ctx(&mut scenario));
            assert!(lootbox::get_treasury_balance(&config) == 200_000_000, 12);

            let (purchased, _, _, _) = lootbox::get_game_stats(&config);
            assert!(purchased == 2, 13);

            sui::transfer::public_transfer(box2, ALICE);
            ts::return_shared(config);
        };

        // Verify refund received by ALICE
        ts::next_tx(&mut scenario, ALICE);
        {
            let refund_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&refund_coin) == 150_000_000, 14); // 0.15 SUI refunded
            ts::return_to_sender(&scenario, refund_coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_open_loot_box_all_rarity_tiers() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // Purchase 4 loot boxes for testing each tier
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(400_000_000, ts::ctx(&mut scenario));

            let b1 = lootbox::purchase_loot_box(&mut config, payment, ts::ctx(&mut scenario));
            sui::transfer::public_transfer(b1, ALICE);
            ts::return_shared(config);
        };

        // 1. Roll Common (roll = 30 < 60, power = 8)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let box_obj = ts::take_from_sender<LootBox>(&scenario);

            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 30, 8, ts::ctx(&mut scenario));

            let (name, rarity, power, serial) = lootbox::get_item_stats(&item);
            assert!(rarity == 0, 20); // Common
            assert!(power == 8, 21);
            assert!(serial == 1, 22);
            assert!(name == string::utf8(b"Rusty Iron Blade"), 23);

            // Verify pity counter incremented to 1
            assert!(lootbox::get_pity_count(&config, ALICE) == 1, 24);

            sui::transfer::public_transfer(item, ALICE);
            ts::return_shared(config);
        };

        // 2. Roll Rare (roll = 70 in [60, 85), power = 18)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));

            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 70, 18, ts::ctx(&mut scenario));
            let (_, rarity, power, _) = lootbox::get_item_stats(&item);
            assert!(rarity == 1, 25); // Rare
            assert!(power == 18, 26);

            // Verify pity counter incremented to 2
            assert!(lootbox::get_pity_count(&config, ALICE) == 2, 27);

            sui::transfer::public_transfer(item, ALICE);
            ts::return_shared(config);
        };

        // 3. Roll Epic (roll = 90 in [85, 97), power = 35)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));

            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 90, 35, ts::ctx(&mut scenario));
            let (_, rarity, power, _) = lootbox::get_item_stats(&item);
            assert!(rarity == 2, 28); // Epic
            assert!(power == 35, 29);

            // Verify pity counter incremented to 3
            assert!(lootbox::get_pity_count(&config, ALICE) == 3, 30);

            sui::transfer::public_transfer(item, ALICE);
            ts::return_shared(config);
        };

        // 4. Roll Legendary (roll = 98 in [97, 100), power = 48)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));

            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 98, 48, ts::ctx(&mut scenario));
            let (_, rarity, power, _) = lootbox::get_item_stats(&item);
            assert!(rarity == 3, 31); // Legendary
            assert!(power == 48, 32);

            // Legendary hit resets pity counter to 0!
            assert!(lootbox::get_pity_count(&config, ALICE) == 0, 33);

            let (pity_counter, total_opened, leg_count) = lootbox::get_pity_stats(&config, ALICE);
            assert!(pity_counter == 0, 34);
            assert!(total_opened == 4, 35);
            assert!(leg_count == 1, 36);

            sui::transfer::public_transfer(item, ALICE);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_pity_system_guarantees_legendary_on_30th_miss() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // Open 30 consecutive Common boxes (roll = 10, non-legendary)
        let mut i = 0;
        while (i < 30) {
            ts::next_tx(&mut scenario, ALICE);
            {
                let mut config = ts::take_shared<GameConfig>(&scenario);
                let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
                let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));

                let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 10, 5, ts::ctx(&mut scenario));
                sui::transfer::public_transfer(item, ALICE);

                ts::return_shared(config);
            };
            i = i + 1;
        };

        // Verify pity counter is now 30
        ts::next_tx(&mut scenario, ALICE);
        {
            let config = ts::take_shared<GameConfig>(&scenario);
            assert!(lootbox::get_pity_count(&config, ALICE) == 30, 40);
            ts::return_shared(config);
        };

        // 31st Open: Even if roll = 0 (which normally is Common), Pity system MUST force Legendary!
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));

            // Passing mock_roll = 0 (would be common without pity)
            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 0, 49, ts::ctx(&mut scenario));
            let (_, rarity, power, _) = lootbox::get_item_stats(&item);

            // GUARANTEED LEGENDARY!
            assert!(rarity == 3, 41);
            assert!(power == 49, 42);

            // Counter must be reset to 0
            assert!(lootbox::get_pity_count(&config, ALICE) == 0, 43);

            let (counter, total, legs) = lootbox::get_pity_stats(&config, ALICE);
            assert!(counter == 0, 44);
            assert!(total == 31, 45);
            assert!(legs == 1, 46);

            sui::transfer::public_transfer(item, ALICE);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_transfer_and_burn_item() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // ALICE purchases and opens a box
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let box_obj = lootbox::purchase_loot_box(&mut config, p, ts::ctx(&mut scenario));
            let item = open_loot_box_deterministic_for_testing(&mut config, box_obj, 88, 30, ts::ctx(&mut scenario));

            // ALICE transfers item to BOB
            lootbox::transfer_item(item, BOB, ts::ctx(&mut scenario));
            ts::return_shared(config);
        };

        // BOB receives the item and burns it
        ts::next_tx(&mut scenario, BOB);
        {
            assert!(ts::has_most_recent_for_sender<GameItem>(&scenario), 50);
            let item = ts::take_from_sender<GameItem>(&scenario);
            assert!(lootbox::item_rarity(&item) == 2, 51); // Epic

            lootbox::burn_item(item, ts::ctx(&mut scenario));
        };

        // Verify BOB has no more items
        ts::next_tx(&mut scenario, BOB);
        {
            assert!(!ts::has_most_recent_for_sender<GameItem>(&scenario), 52);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_admin_updates_and_treasury_withdrawal() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // ALICE purchases boxes to fund treasury (3 boxes = 3 * 0.1 = 0.3 SUI)
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let p1 = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let b1 = lootbox::purchase_loot_box(&mut config, p1, ts::ctx(&mut scenario));
            let p2 = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let b2 = lootbox::purchase_loot_box(&mut config, p2, ts::ctx(&mut scenario));
            let p3 = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            let b3 = lootbox::purchase_loot_box(&mut config, p3, ts::ctx(&mut scenario));

            sui::transfer::public_transfer(b1, ALICE);
            sui::transfer::public_transfer(b2, ALICE);
            sui::transfer::public_transfer(b3, ALICE);
            ts::return_shared(config);
        };

        // ADMIN updates drop weights (50, 30, 15, 5 = 100), price (0.2 SUI), and withdraws 0.1 SUI
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // Treasury currently holds 300_000_000 MIST (0.3 SUI)
            assert!(lootbox::get_treasury_balance(&config) == 300_000_000, 59);

            lootbox::update_rarity_weights(&admin_cap, &mut config, 50, 30, 15, 5);
            let (c, r, e, l) = lootbox::get_rarity_weights(&config);
            assert!(c == 50 && r == 30 && e == 15 && l == 5, 60);

            lootbox::update_price(&admin_cap, &mut config, 200_000_000);
            assert!(lootbox::get_box_price(&config) == 200_000_000, 61);

            lootbox::update_pity_threshold(&admin_cap, &mut config, 25);
            assert!(lootbox::get_pity_threshold(&config) == 25, 62);

            // Withdraw 0.1 SUI to ADMIN (leaving 0.2 SUI in treasury)
            lootbox::withdraw_treasury(&admin_cap, &mut config, 100_000_000, ADMIN, ts::ctx(&mut scenario));
            assert!(lootbox::get_treasury_balance(&config) == 200_000_000, 63);

            // Pause game
            lootbox::set_paused(&admin_cap, &mut config, true);
            let (_, _, _, paused) = lootbox::get_game_stats(&config);
            assert!(paused == true, 64);

            // Unpause game
            lootbox::set_paused(&admin_cap, &mut config, false);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = gaminglootbox::lootbox::EInsufficientPayment)]
    fun test_purchase_fails_with_insufficient_payment() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            // Pay 0.05 SUI when price is 0.1 SUI
            let underpayment = coin::mint_for_testing<SUI>(50_000_000, ts::ctx(&mut scenario));

            let box_obj = lootbox::purchase_loot_box(&mut config, underpayment, ts::ctx(&mut scenario));
            sui::transfer::public_transfer(box_obj, ALICE);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = gaminglootbox::lootbox::EWeightsMustSumTo100)]
    fun test_admin_update_weights_fails_when_sum_not_100() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // Sum is 60 + 25 + 10 + 3 = 98 (!= 100) -> Abort!
            lootbox::update_rarity_weights(&admin_cap, &mut config, 60, 25, 10, 3);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = gaminglootbox::lootbox::EGameIsPaused)]
    fun test_purchase_fails_when_game_paused() {
        let mut scenario = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut scenario));
        };

        // ADMIN pauses the game
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            lootbox::set_paused(&admin_cap, &mut config, true);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // ALICE attempts to purchase while paused -> Abort!
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut config = ts::take_shared<GameConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));

            let box_obj = lootbox::purchase_loot_box(&mut config, payment, ts::ctx(&mut scenario));
            sui::transfer::public_transfer(box_obj, ALICE);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }
}
