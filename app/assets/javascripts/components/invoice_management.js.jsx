var InvoiceBody = React.createClass({
  propTypes: {
    invoice:React.PropTypes.object,
    random_id:React.PropTypes.string
  },
  getInitialState: ()=>{
    return {contentLoaded:false, ur_invoices:[]};
  },
  componentDidMount:function(){
    var handle = this;
    $(`#invoice-body-${this.props.random_id}`).on('shown.bs.collapse', function(e){
      if(!handle.state.contentLoaded){
        fetch(`/monolith/invoices/${handle.props.invoice.id}/ur_invoices`, {
          credentials:'same-origin'
        }).then(function(response){
          return response.json();
        }).then(function(json){
            handle.setState({ ur_invoices:json, contentLoaded:true });
        })
      };
    });
  },
  render: function(){
    var content_body = this.state.contentLoaded ? (
      <div>
        <ul>{ this.state.ur_invoices.map( (ur_invoice, index) => {
            return (<li key={index}>{ur_invoice.billing_category} - {ur_invoice.final_total}</li>)
          })}
        </ul>
      </div>
    ) : (
      <p>
        <i className="fa fa-cog fa-spin"></i> Loading invoice ...
      </p>
    );
    return (<div id={`invoice-body-${this.props.random_id}`}>{content_body}</div>)
  }
});

var InvoiceManagerSidebar = React.createClass({
  render: function(){
    var handle = this;

    return (
      <div className="card">
        <ul className="list-group list-group-flush">
          {
            handle.props.invoiceCategory.map( (e,i) => {
              var invoiceCount = 0;
              switch (e) {
                case "all":
                  invoiceCount = handle.props.invoices.length;
                  break;
                case "outstanding":
                  invoiceCount = handle.props.invoices.filter(function(x){ return x.status == "outstanding"}).length;
                  break;
                case "settled":
                  invoiceCount = handle.props.invoices.filter(function(x){ return x.status == "settled"}).length;
                  break;
                default:
                  invoiceCount = 0;
              };
              return (<li key={i} className="list-group-item">{e} ({invoiceCount})</li>)
            } )
          }
        </ul>
      </div>
    )
    return (<div>Invoice Manager Sidebar here</div>)
  }
});

var InvoiceManagerBody = React.createClass({
  render: function(){
    var invoice_listing = this.props.invoices.length == 0 ? (
      <li className="list-group-item"> Nothing to show... </li>
    ) : (
      this.props.invoices.map( (invoice,invoice_index) => {
        var random_id = randomID();
        return (
          <li key={invoice_index} className="list-group-item">
            <div className="w-100" data-toggle="collapse" data-target={`#invoice-body-${random_id}`}>
              { invoice.user.name } - {invoice.billing_date} - {toCurrency(invoice.total_billing)}
            </div>
            <div className="collapse" id={`invoice-body-${random_id}`}>
              <InvoiceBody invoice={invoice} random_id={random_id} />
            </div>
          </li>
        )
      })
    );

    return (
      <div className="card">
        <ul className="list-group list-group-flush">{ invoice_listing}</ul>
      </div>
    )
  }
});

var InvoiceManager = React.createClass({
  propTypes: {
    invoiceCategory: React.PropTypes.array
  },
  getDefaultProps: () => {
    return {
      invoiceCategory: ["all", "outstanding", "settled"]
    }
  },
  getInitialState: ()=> {
    return {
      selectedInvoiceCategory:0,
      invoices:[]
    }
  },
  componentDidMount: function(){

    //load up the invoices
    this.loadInvoice();
  },
  loadInvoice: function(){
    var handle = this;
    //load invoice to component
    fetch('/monolith/invoices/load', {
      credentials:'same-origin'
    }).then(function(response){
      return response.json();
    }).then(function(json){
      handle.setState({invoices:json});

    })
  },
  selectCategory: function(e){
    //handle when cateogry selected has been changed
  },
  render: function(){
    return (
      <div className="row">
        <div className="col-3"><InvoiceManagerSidebar invoiceCategory={this.props.invoiceCategory} invoices={this.state.invoices}/></div>
        <div className="col-9"><InvoiceManagerBody invoices={this.state.invoices}/></div>
      </div>
    );
  }
})
