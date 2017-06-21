class Admin::BillingsController < ApplicationController
  before_action :admins_only

  def index
    #@invoice = current_user.invoices.order(:billing_date).last
    @invoices = current_user.invoices.order(:billing_date => :desc).limit(5)
    @ageing = current_user.invoice_ageing
  end

  def settings
  end
end
