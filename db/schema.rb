# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170914073235) do

  create_table "amenities", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.string "label"
    t.string "icon"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "amenity_lists", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "golf_club_id"
    t.integer "amenity_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["amenity_id"], name: "index_amenity_lists_on_amenity_id"
    t.index ["golf_club_id"], name: "index_amenity_lists_on_golf_club_id"
  end

  create_table "charge_schedules", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "golf_club_id"
    t.decimal "caddy", precision: 8, scale: 2
    t.decimal "cart", precision: 8, scale: 2
    t.integer "sessions_per_hour"
    t.integer "slots_per_session"
    t.integer "pax_per_slot"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer "max_caddy_per_slot"
    t.integer "max_buggy_per_slot"
    t.decimal "session_price", precision: 8, scale: 2
    t.decimal "insurance", precision: 8, scale: 2
    t.integer "flight_schedule_id"
    t.text "note"
    t.integer "insurance_mode", default: 0
    t.index ["flight_schedule_id"], name: "index_charge_schedules_on_flight_schedule_id"
    t.index ["golf_club_id"], name: "index_charge_schedules_on_golf_club_id"
  end

  create_table "course_global_settings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "golf_club_id"
    t.integer "admin_selection", default: 0
    t.integer "user_selection", default: 0
    t.index ["golf_club_id"], name: "index_course_global_settings_on_golf_club_id"
  end

  create_table "course_listings", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "golf_club_id"
    t.text "name", limit: 255
    t.integer "course_status_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_status_id"], name: "index_course_listings_on_course_status_id"
    t.index ["golf_club_id"], name: "index_course_listings_on_golf_club_id"
  end

  create_table "course_setting_properties", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "label", limit: 160
    t.string "desc"
    t.integer "expected_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "course_settings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "course_listing_id"
    t.string "value_type"
    t.integer "value_int"
    t.string "value_string"
    t.string "value_min"
    t.string "value_max"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "course_setting_property_id"
    t.index ["course_listing_id"], name: "index_course_settings_on_course_listing_id"
    t.index ["course_setting_property_id"], name: "index_course_settings_on_course_setting_property_id"
  end

  create_table "course_statuses", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.text "desc", limit: 255
    t.boolean "available"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "flight_matrices", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "flight_schedule_id"
    t.integer "timeslot"
    t.integer "day0"
    t.integer "day1"
    t.integer "day2"
    t.integer "day3"
    t.integer "day4"
    t.integer "day5"
    t.integer "day6"
    t.integer "day7"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.time "tee_time"
    t.datetime "start_active_at", default: "2017-01-01 00:00:00"
    t.datetime "end_active_at", default: "3017-01-01 00:00:00"
    t.integer "flight_order", default: 0
    t.time "second_tee_time"
    t.index ["flight_schedule_id"], name: "index_flight_matrices_on_flight_schedule_id"
  end

  create_table "flight_schedules", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "flight_times"
    t.integer "min_pax"
    t.integer "max_pax"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "golf_club_id"
    t.string "name"
    t.integer "min_cart", default: 0
    t.integer "max_cart", default: 2
    t.integer "min_caddy", default: 0
    t.integer "max_caddy", default: 2
    t.datetime "start_active_at", default: "2017-01-01 00:00:00"
    t.datetime "end_active_at", default: "3017-01-01 00:00:00"
    t.index ["golf_club_id"], name: "index_flight_schedules_on_golf_club_id"
  end

  create_table "golf_clubs", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.text "description"
    t.string "address"
    t.time "open_hour"
    t.time "close_hour"
    t.integer "user_id"
    t.string "lat"
    t.string "lng"
    t.integer "tax_schedule_id"
    t.integer "flight_selection_method", default: 0
    t.index ["tax_schedule_id"], name: "index_golf_clubs_on_tax_schedule_id"
    t.index ["user_id"], name: "index_golf_clubs_on_user_id"
  end

  create_table "invoice_item_categories", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "description", limit: 500
    t.string "caption", limit: 80
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "code", limit: 3
  end

  create_table "invoice_items", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "invoice_id"
    t.decimal "charges", precision: 15, scale: 2, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "invoice_item_category_id"
    t.string "note", limit: 160
    t.index ["invoice_id"], name: "index_invoice_items_on_invoice_id"
    t.index ["invoice_item_category_id"], name: "index_invoice_items_on_invoice_item_category_id"
  end

  create_table "invoices", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.decimal "total_billing", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "start_billing_period"
    t.date "end_billing_period"
    t.date "billing_date"
    t.integer "status", default: 0
    t.index ["user_id"], name: "index_invoices_on_user_id"
  end

  create_table "line_item_listings", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.decimal "rate", precision: 10, scale: 2
    t.boolean "taxed"
    t.integer "charge_schedule_id"
    t.integer "line_item_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["charge_schedule_id"], name: "index_line_item_listings_on_charge_schedule_id"
    t.index ["line_item_id"], name: "index_line_item_listings_on_line_item_id"
  end

  create_table "line_items", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.text "name", limit: 255
    t.string "description"
    t.boolean "mandatory"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.index ["user_id"], name: "index_line_items_on_user_id"
  end

  create_table "memberships", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.integer "golf_club_id"
    t.date "expires_at"
    t.string "alt_club_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["golf_club_id"], name: "index_memberships_on_golf_club_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "photos", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "sequence"
    t.integer "user_id"
    t.string "imageable_type"
    t.integer "imageable_id"
    t.string "avatar"
    t.text "caption", limit: 255
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imageable_type", "imageable_id"], name: "index_photos_on_imageable_type_and_imageable_id"
    t.index ["user_id"], name: "index_photos_on_user_id"
  end

  create_table "reviews", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.string "topic_type"
    t.integer "topic_id"
    t.integer "rating"
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["topic_type", "topic_id"], name: "index_reviews_on_topic_type_and_topic_id"
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "tax_schedules", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.text "country", limit: 255
    t.decimal "rate", precision: 6, scale: 5
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ur_contacts", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.string "name"
    t.string "email"
    t.string "telephone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_ur_contacts_on_user_id"
  end

  create_table "ur_invoices", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_reservation_id"
    t.integer "invoice_id"
    t.decimal "final_total", precision: 10, scale: 2
    t.integer "billing_category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "golf_club_id"
    t.index ["golf_club_id"], name: "index_ur_invoices_on_golf_club_id"
    t.index ["invoice_id"], name: "index_ur_invoices_on_invoice_id"
    t.index ["user_reservation_id"], name: "index_ur_invoices_on_user_reservation_id"
  end

  create_table "ur_member_details", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.string "member_id"
    t.integer "user_reservation_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_reservation_id"], name: "index_ur_member_details_on_user_reservation_id"
  end

  create_table "ur_transactions", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_reservation_id"
    t.decimal "trans_amount", precision: 8, scale: 2
    t.integer "detail_type"
    t.string "notes"
    t.index ["user_reservation_id"], name: "index_ur_transactions_on_user_reservation_id"
  end

  create_table "user_reservations", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.integer "charge_schedule_id"
    t.integer "actual_caddy"
    t.integer "actual_buggy"
    t.integer "actual_pax"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "golf_club_id"
    t.datetime "booking_datetime"
    t.date "booking_date"
    t.time "booking_time"
    t.integer "status"
    t.string "token"
    t.integer "flight_matrix_id"
    t.decimal "actual_insurance", precision: 8, scale: 2
    t.integer "count_caddy"
    t.integer "count_buggy"
    t.integer "count_pax"
    t.integer "count_insurance"
    t.decimal "actual_tax", precision: 10, scale: 2
    t.integer "course_listing_id"
    t.integer "count_member", default: 0
    t.integer "last_paper_trail_id"
    t.integer "reserve_method", default: 0
    t.string "contact_type"
    t.integer "contact_id"
    t.time "second_booking_time"
    t.integer "second_course_listing_id"
    t.index ["charge_schedule_id"], name: "index_user_reservations_on_charge_schedule_id"
    t.index ["contact_type", "contact_id"], name: "index_user_reservations_on_contact_type_and_contact_id"
    t.index ["course_listing_id"], name: "index_user_reservations_on_course_listing_id"
    t.index ["flight_matrix_id"], name: "index_user_reservations_on_flight_matrix_id"
    t.index ["golf_club_id"], name: "index_user_reservations_on_golf_club_id"
    t.index ["second_course_listing_id"], name: "index_user_reservations_on_second_course_listing_id"
    t.index ["user_id"], name: "index_user_reservations_on_user_id"
  end

  create_table "users", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "provider"
    t.string "uid"
    t.string "password"
    t.string "name"
    t.string "image_path"
    t.integer "role"
    t.integer "handicap"
    t.integer "profile_picture_id"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "telephone", limit: 12
    t.integer "billing_cycle"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "versions", id: :integer, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.string "item_type", limit: 191, null: false
    t.integer "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object", limit: 4294967295
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "amenity_lists", "amenities"
  add_foreign_key "amenity_lists", "golf_clubs"
  add_foreign_key "charge_schedules", "flight_schedules"
  add_foreign_key "charge_schedules", "golf_clubs"
  add_foreign_key "course_global_settings", "golf_clubs"
  add_foreign_key "course_listings", "course_statuses"
  add_foreign_key "course_listings", "golf_clubs"
  add_foreign_key "course_settings", "course_listings"
  add_foreign_key "course_settings", "course_setting_properties"
  add_foreign_key "flight_matrices", "flight_schedules"
  add_foreign_key "flight_schedules", "golf_clubs"
  add_foreign_key "golf_clubs", "tax_schedules"
  add_foreign_key "golf_clubs", "users"
  add_foreign_key "invoice_items", "invoice_item_categories"
  add_foreign_key "invoice_items", "invoices"
  add_foreign_key "invoices", "users"
  add_foreign_key "line_item_listings", "charge_schedules"
  add_foreign_key "line_item_listings", "line_items"
  add_foreign_key "line_items", "users"
  add_foreign_key "memberships", "golf_clubs"
  add_foreign_key "memberships", "users"
  add_foreign_key "photos", "users"
  add_foreign_key "reviews", "users"
  add_foreign_key "ur_contacts", "users"
  add_foreign_key "ur_invoices", "golf_clubs"
  add_foreign_key "ur_invoices", "invoices"
  add_foreign_key "ur_invoices", "user_reservations"
  add_foreign_key "ur_member_details", "user_reservations"
  add_foreign_key "ur_transactions", "user_reservations"
  add_foreign_key "user_reservations", "charge_schedules"
  add_foreign_key "user_reservations", "course_listings"
  add_foreign_key "user_reservations", "course_listings", column: "second_course_listing_id"
  add_foreign_key "user_reservations", "flight_matrices"
  add_foreign_key "user_reservations", "golf_clubs"
  add_foreign_key "user_reservations", "users"
end
