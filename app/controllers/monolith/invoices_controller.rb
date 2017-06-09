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
end
