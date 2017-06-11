class Monolith::UrInvoicesController < ApplicationController
  before_action :superadmins_only

  #GET      /monolith/invoices/:invoice_id/ur_invoices(.:format)
  # load the invoice for
  def index
    invoice = Invoice.find(params[:invoice_id])

    render json: invoice.ur_invoices
  end
end
