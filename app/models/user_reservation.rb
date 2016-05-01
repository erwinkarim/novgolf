class UserReservation < ActiveRecord::Base
  belongs_to :user
  belongs_to :price_schedule
  belongs_to :golf_club
end
