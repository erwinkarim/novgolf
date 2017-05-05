class UrContact < ApplicationRecord
  belongs_to :user
  belongs_to :user_reservation
end
