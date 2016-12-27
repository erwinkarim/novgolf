class UrTransaction < ActiveRecord::Base
  belongs_to :user_reservation
  validates_presence_of :user_reservation_id, :trans_amount, :detail_type
  enum detail_type: [:initial_charge, :delta_charge, :cash_payment, :cc_payment]

  after_initialize :init

  def init
    self.trans_amount ||= 0.0
    self.detail_type ||= 0
  end
end
