require 'test_helper'

class InvoiceItemCategoryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  should validate_presence_of(:caption)
  should validate_presence_of(:description)
end
