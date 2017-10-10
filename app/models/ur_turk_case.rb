class UrTurkCase < ApplicationRecord
  belongs_to :user_reservation
  belongs_to :user

  has_many :ur_turk_case_histories
  validates_presence_of :user_reservation_id, :user_id
end
