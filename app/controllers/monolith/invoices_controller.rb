class Monolith::InvoicesController < ApplicationController
  before_action :superadmins_only

  def index
  end

  # POST     /monolith/invoice/generate(.:format)
  # generate invoice based on billing date
  # TODO: only accept this from within amazon or local
  def generate
    GenerateInvoiceJob.perform_later
  end

  # GET      /monolith/invoices/load(.:format)
  #load them invoices
  def load
    offset = params.has_key?(:offset) ? params[:offset] : 0

    invoices = Invoice.order(:billing_date => :desc).offset(offset).limit(100)

    render json: invoices.map{ |x| x.attributes.merge({user:x.user})}
  end

end
