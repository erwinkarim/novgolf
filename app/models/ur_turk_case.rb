class UrTurkCase < ApplicationRecord
  belongs_to :user_reservation
  belongs_to :owner
end
