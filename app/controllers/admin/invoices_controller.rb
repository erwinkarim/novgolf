class Admin::InvoicesController < ApplicationController
  before_action :admins_only

  # GET      /admin/billings/invoices(.:format)
  def index
    @invoices = current_user.invoices.order(:billing_date => :desc).limit(5)
  end

  # GET      /admin/billings/invoices/:id(.:format)
  def show
    #ensure that the invoice exits and the current user owns this
    @invoice = Invoice.find(params[:id])

    if @invoice.nil? then
      render file "public/400.html", status: :bad_request
      return
    end

    if @invoice.user_id != current_user.id then
      render file: "public/401.html", status: :not_authorized
      return
    end

    #setup for itemized billing
    @online_trax = @invoice.ur_invoices.where(:billing_category => "online")
    @dashboard_tranx = @invoice.ur_invoices.where(:billing_category => "dashboard")
  end
end
