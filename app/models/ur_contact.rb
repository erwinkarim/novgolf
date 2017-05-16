class UrContact < ApplicationRecord
  belongs_to :user
  has_many :user_reservations, as: :contact

  validates_presence_of :user_id, :name
end
