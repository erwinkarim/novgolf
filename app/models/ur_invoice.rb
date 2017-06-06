class UrInvoice < ApplicationRecord
  belongs_to :user_reservation
  belongs_to :invoice
end
