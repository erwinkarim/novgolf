class GenerateInvoiceJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # generate invoice based on today's billing cycle
    # TODO: should generate invoice of billing cycle of 2 days ago since
    #  user reservaiton status is locked 24 hours after booking date and time
    Invoice.generate_invoice
  end
end
