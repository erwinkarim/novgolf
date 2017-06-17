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

  # GET      /monolith/invoices/:id
  def show
    invoice = Invoice.find(params[:id])

    # add club id + user_reservation info
    invoice = invoice.attributes.merge({
        billing_due_date: invoice.billing_date + 14.days,
        ur_invoices:invoice.ur_invoices.map{ |x| x.attributes.merge({
            golf_club_name:x.golf_club.name, user_reservation:x.user_reservation
          })},
        invoice_items:invoice.invoice_items.map{ |x| x.attributes.merge({
            invoice_item_category:x.invoice_item_category
          })}
      })

    #render json: invoice.attributes.merge({ur_invoices:invoice.ur_invoices})
    render json: invoice
  end

  #setup the settlement
  # GET      /monolith/invoices/:invoice_id/settlement(.:format)
  def settlement
    @invoice = Invoice.find(params[:invoice_id])
  end

  # process the settlement
  # POST     /monolith/invoices/:invoice_id/settlement
  def place_settlement
    @invoice = Invoice.find(params[:invoice_id])

    #check settlment parms
    #create a new invoice_items describing the payment via cc or something
    @invoice.charge params[:amount], params[:payment_method], params[:note]

    flash[:notice] = "Settlement Placed"
    render "settlement"
  end

  # GET      /monolith/invoices/load(.:format)
  #load them invoices
  def load
    offset = params.has_key?(:offset) ? params[:offset] : 0

    invoices = Invoice.order(:billing_date => :desc).offset(offset).limit(100)

    render json: invoices.map{ |x| x.attributes.merge({user:x.user, billing_due_date:x.billing_date+14.days})}
  end

end
