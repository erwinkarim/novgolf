class GenerateInvoiceJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # generate invoice
    Invoice.generate_invoice
  end
end
