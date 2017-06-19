class InvoiceItem < ApplicationRecord
  belongs_to :invoice
  validates_presence_of :invoice_id, :charges, :invoice_item_category_id
  belongs_to :invoice_item_category

end
