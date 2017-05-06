class UrContact < ApplicationRecord
  belongs_to :user
  belongs_to :user_reservation

  validates_presence_of :user_id, :user_reservation_id, :name
end
