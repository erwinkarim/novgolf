require 'test_helper'

class InvoiceTest < ActiveSupport::TestCase
  should belong_to :user
  should have_many :ur_invoices

  should validate_presence_of(:status)
  should validate_uniqueness_of(:user_id).
    scoped_to([:start_billing_period, :end_billing_period]).
    with_message('- only one invoice per billing period')

  # test "the truth" do
  #   assert true
  # end
end
