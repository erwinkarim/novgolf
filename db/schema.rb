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

ActiveRecord::Schema.define(version: 20160501013624) do

  create_table "charge_schedules", force: :cascade do |t|
    t.integer  "golf_club_id"
    t.decimal  "caddy",              precision: 8, scale: 2
    t.decimal  "cart",               precision: 8, scale: 2
    t.integer  "sessions_per_hour"
    t.integer  "slots_per_session"
    t.integer  "pax_per_slot"
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "max_caddy_per_slot"
    t.integer  "max_buggy_per_slot"
    t.decimal  "session_price",      precision: 8, scale: 2
    t.decimal  "insurance",          precision: 8, scale: 2
  end

  add_index "charge_schedules", ["golf_club_id"], name: "index_charge_schedules_on_golf_club_id"

  create_table "flight_matrices", force: :cascade do |t|
    t.integer  "flight_schedule_id"
    t.integer  "timeslot"
    t.integer  "day0"
    t.integer  "day1"
    t.integer  "day2"
    t.integer  "day3"
    t.integer  "day4"
    t.integer  "day5"
    t.integer  "day6"
    t.integer  "day7"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.time     "tee_time"
  end

  add_index "flight_matrices", ["flight_schedule_id"], name: "index_flight_matrices_on_flight_schedule_id"

  create_table "flight_schedules", force: :cascade do |t|
    t.string   "flight_times"
    t.integer  "min_pax"
    t.integer  "max_pax"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.integer  "golf_club_id"
  end

  add_index "flight_schedules", ["golf_club_id"], name: "index_flight_schedules_on_golf_club_id"

  create_table "golf_clubs", force: :cascade do |t|
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string   "name"
    t.string   "description"
    t.string   "address"
    t.time     "open_hour"
    t.time     "close_hour"
  end

  create_table "user_reservations", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "charge_schedule_id"
    t.integer  "actual_caddy"
    t.integer  "actual_buggy"
    t.integer  "actual_pax"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.integer  "golf_club_id"
    t.datetime "booking_datetime"
  end

  add_index "user_reservations", ["charge_schedule_id"], name: "index_user_reservations_on_charge_schedule_id"
  add_index "user_reservations", ["golf_club_id"], name: "index_user_reservations_on_golf_club_id"
  add_index "user_reservations", ["user_id"], name: "index_user_reservations_on_user_id"

  create_table "users", force: :cascade do |t|
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "provider"
    t.string   "uid"
    t.string   "password"
    t.string   "name"
    t.string   "image"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

end
