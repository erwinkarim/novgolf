# encoding: UTF-8
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

ActiveRecord::Schema.define(version: 20160701134825) do

  create_table "amenities", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.string   "label",      limit: 255
    t.string   "icon",       limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "amenity_lists", force: :cascade do |t|
    t.integer  "golf_club_id", limit: 4
    t.integer  "amenity_id",   limit: 4
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "amenity_lists", ["amenity_id"], name: "index_amenity_lists_on_amenity_id", using: :btree
  add_index "amenity_lists", ["golf_club_id"], name: "index_amenity_lists_on_golf_club_id", using: :btree

  create_table "charge_schedules", force: :cascade do |t|
    t.integer  "golf_club_id",       limit: 4
    t.decimal  "caddy",                            precision: 8, scale: 2
    t.decimal  "cart",                             precision: 8, scale: 2
    t.integer  "sessions_per_hour",  limit: 4
    t.integer  "slots_per_session",  limit: 4
    t.integer  "pax_per_slot",       limit: 4
    t.datetime "created_at",                                                           null: false
    t.datetime "updated_at",                                                           null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "max_caddy_per_slot", limit: 4
    t.integer  "max_buggy_per_slot", limit: 4
    t.decimal  "session_price",                    precision: 8, scale: 2
    t.decimal  "insurance",                        precision: 8, scale: 2
    t.integer  "flight_schedule_id", limit: 4
    t.text     "note",               limit: 65535
    t.integer  "insurance_mode",     limit: 4,                             default: 0
  end

  add_index "charge_schedules", ["flight_schedule_id"], name: "index_charge_schedules_on_flight_schedule_id", using: :btree
  add_index "charge_schedules", ["golf_club_id"], name: "index_charge_schedules_on_golf_club_id", using: :btree

  create_table "flight_matrices", force: :cascade do |t|
    t.integer  "flight_schedule_id", limit: 4
    t.integer  "timeslot",           limit: 4
    t.integer  "day0",               limit: 4
    t.integer  "day1",               limit: 4
    t.integer  "day2",               limit: 4
    t.integer  "day3",               limit: 4
    t.integer  "day4",               limit: 4
    t.integer  "day5",               limit: 4
    t.integer  "day6",               limit: 4
    t.integer  "day7",               limit: 4
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.time     "tee_time"
  end

  add_index "flight_matrices", ["flight_schedule_id"], name: "index_flight_matrices_on_flight_schedule_id", using: :btree

  create_table "flight_schedules", force: :cascade do |t|
    t.string   "flight_times", limit: 255
    t.integer  "min_pax",      limit: 4
    t.integer  "max_pax",      limit: 4
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.integer  "golf_club_id", limit: 4
    t.string   "name",         limit: 255
    t.integer  "min_cart",     limit: 4,   default: 0
    t.integer  "max_cart",     limit: 4,   default: 2
    t.integer  "min_caddy",    limit: 4,   default: 0
    t.integer  "max_caddy",    limit: 4,   default: 2
  end

  add_index "flight_schedules", ["golf_club_id"], name: "index_flight_schedules_on_golf_club_id", using: :btree

  create_table "golf_clubs", force: :cascade do |t|
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.string   "name",        limit: 255
    t.text     "description", limit: 65535
    t.string   "address",     limit: 255
    t.time     "open_hour"
    t.time     "close_hour"
    t.integer  "user_id",     limit: 4
    t.string   "lat",         limit: 255
    t.string   "lng",         limit: 255
  end

  add_index "golf_clubs", ["user_id"], name: "index_golf_clubs_on_user_id", using: :btree

  create_table "user_reservations", force: :cascade do |t|
    t.integer  "user_id",            limit: 4
    t.integer  "charge_schedule_id", limit: 4
    t.integer  "actual_caddy",       limit: 4
    t.integer  "actual_buggy",       limit: 4
    t.integer  "actual_pax",         limit: 4
    t.datetime "created_at",                                             null: false
    t.datetime "updated_at",                                             null: false
    t.integer  "golf_club_id",       limit: 4
    t.datetime "booking_datetime"
    t.date     "booking_date"
    t.time     "booking_time"
    t.integer  "status",             limit: 4
    t.string   "token",              limit: 255
    t.integer  "flight_matrix_id",   limit: 4
    t.decimal  "actual_insurance",               precision: 8, scale: 2
    t.integer  "count_caddy",        limit: 4
    t.integer  "count_buggy",        limit: 4
    t.integer  "count_pax",          limit: 4
    t.integer  "count_insurance",    limit: 4
  end

  add_index "user_reservations", ["charge_schedule_id"], name: "index_user_reservations_on_charge_schedule_id", using: :btree
  add_index "user_reservations", ["flight_matrix_id"], name: "index_user_reservations_on_flight_matrix_id", using: :btree
  add_index "user_reservations", ["golf_club_id"], name: "index_user_reservations_on_golf_club_id", using: :btree
  add_index "user_reservations", ["user_id"], name: "index_user_reservations_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.string   "provider",               limit: 255
    t.string   "uid",                    limit: 255
    t.string   "password",               limit: 255
    t.string   "name",                   limit: 255
    t.string   "image",                  limit: 255
    t.integer  "role",                   limit: 4
    t.string   "home_club",              limit: 255
    t.integer  "handicap",               limit: 4
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  add_foreign_key "amenity_lists", "amenities"
  add_foreign_key "amenity_lists", "golf_clubs"
  add_foreign_key "charge_schedules", "flight_schedules"
  add_foreign_key "charge_schedules", "golf_clubs"
  add_foreign_key "flight_matrices", "flight_schedules"
  add_foreign_key "flight_schedules", "golf_clubs"
  add_foreign_key "golf_clubs", "users"
  add_foreign_key "user_reservations", "charge_schedules"
  add_foreign_key "user_reservations", "flight_matrices"
  add_foreign_key "user_reservations", "golf_clubs"
  add_foreign_key "user_reservations", "users"
end
