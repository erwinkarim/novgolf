class UrInvoice < ApplicationRecord
  belongs_to :user_reservation
  belongs_to :invoice
  belongs_to :golf_club

  enum billing_category: UserReservation.reserve_methods.keys.map{ |x| x.to_sym }
end
