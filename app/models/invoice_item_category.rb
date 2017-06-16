class InvoiceItemCategory < ApplicationRecord
  validates_presence_of :caption
  validates_presence_of :description
end
