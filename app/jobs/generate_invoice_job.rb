class GenerateInvoiceJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # generate invoice based on today's billing cycle
    Invoice.generate_invoice
  end
end
