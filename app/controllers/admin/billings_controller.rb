class Admin::BillingsController < ApplicationController
  before_action :admins_only

  def index
    @invoice = current_user.invoices.last
  end

  def settings
  end
end
