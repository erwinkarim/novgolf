class Invoke::JobsController < ApplicationController
  #TODO: limit the access this controller from internal AWS or localhost only

  # GET      /invoke/invoices(.:format)
  # invoke job to generate invoices
  def invoices
    GenerateInvoiceJob.perform_later

    render json: {message:'GenerateInvoiceJob invoked', status: :ok}
  end
end
