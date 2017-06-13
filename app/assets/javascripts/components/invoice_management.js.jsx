var InvoiceBody = React.createClass({
  propTypes: {
    invoice:React.PropTypes.object,
    random_id:React.PropTypes.string
  },
  getInitialState: ()=>{
    return {contentLoaded:false, ur_invoices:[], invoice:{}};
  },
  componentDidMount:function(){
    var handle = this;
    $(`#invoice-body-${this.props.random_id}`).on('shown.bs.collapse', function(e){
      if(!handle.state.contentLoaded){
        fetch(`/monolith/invoices/${handle.props.invoice.id}`, {
          credentials:'same-origin'
        }).then(function(response){
          return response.json();
        }).then(function(json){
            handle.setState({ invoice:json, ur_invoices:json.ur_invoices, contentLoaded:true });
        })
      };
    });
  },
  render: function(){
    if(!this.state.contentLoaded){
      return (<div id={`invoice-body-${this.props.random_id}`}>
        <i className="fa fa-cog fa-spin"></i> Loading invoice ...
        </div>);
    };

    var tranx = [
      {
        caption:'online',
        ur_invoices: this.state.invoice.ur_invoices.filter(
          (x)=> {return x.billing_category == "online";}).sort(
            (a,b)=> {return a.golf_club_id - b.golf_club_id;})
      },
      {
        caption:'dashboard',
        ur_invoices: this.state.invoice.ur_invoices.filter(
          (x)=> {return x.billing_category == "dashboard";}).sort(
            (a,b)=> {return a.golf_club_id - b.golf_club_id;})
      }
    ]
    /*
    var online_traxs = this.state.invoice.ur_invoices.filter(
      (x)=> {return x.billing_category == "online";}).sort(
        (a,b)=> {return a.golf_club_id - b.golf_club_id;});
    var dashboard_tranx = this.state.invoice.ur_invoices.filter(
      (x)=> {return x.billing_category == "dashboard";}).sort(
        (a,b)=> {return a.golf_club_id - b.golf_club_id;});
        */

    var content_body = (
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Billing Date</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{this.state.invoice.billing_date}</td>
              <td>{this.state.invoice.status}</td>
              <td>{this.state.invoice.billing_date}</td>
              <td>{toCurrency(this.state.invoice.total_billing)}</td>
            </tr>
          </tbody>
        </table>
        <p>Billing period is from {this.state.invoice.start_billing_period} to {this.state.invoice.end_billing_period}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {
              tranx.map( (elm,index) => {
                var random_id = randomID();

                return (
                  <tr key={index}>
                    <td>
                      <a href={`#club-tranx-${random_id}`} data-toggle="collapse">
                        <i className="fa fa-plus"></i>
                      </a>
                      <span> </span>
                      {elm.ur_invoices.length } {elm.caption} transactions
                      <div className="collapse" id={`club-tranx-${random_id}`}>
                        {
                          //split by clubs
                          // TODO: show club name instead of club id
                          Object.entries(groupBy(elm.ur_invoices, 'golf_club_name')).map( (club_elm, club_index) => {
                            var club_random_id = randomID();
                            return (
                              <div key={club_index} className="ml-2 pt-1 pb-1">
                                <a href={`#club-tranx-detail-${club_random_id}`} data-toggle="collapse">
                                  <i className="fa fa-plus"></i>
                                </a><span> </span>
                                <strong> {club_elm[0]} </strong>
                                <span> - {club_elm[1].length} transaction(s) - </span>
                                {toCurrency(club_elm[1].map(x=>parseFloat(x.final_total)).reduce((a,v) => {return a+v;}, 0) )}
                                <div className="ml-4 collapse" id={`club-tranx-detail-${club_random_id}`} >
                                  <ul className="list-unstyled">
                                    {
                                      club_elm[1].map( (ur_invoice, ur_invoice_elm) => {
                                        var booking_time = new Date(ur_invoice.user_reservation.booking_time);
                                        return (
                                          <li key={ur_invoice_elm}>
                                            {ur_invoice.user_reservation.booking_date}@
                                            {`${pad(booking_time.getHours())}:${pad(booking_time.getMinutes())}`}
                                            <span> - </span>
                                            {toCurrency(ur_invoice.final_total)}
                                          </li>
                                        )
                                      })
                                    }
                                  </ul>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </td>
                    <td>{toCurrency(elm.ur_invoices.map( x => parseFloat(x.final_total) ).reduce( (a,v) => { return a+v; }, 0) )}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
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
              return (
                <li key={i} className="list-group-item justify-content-between">
                  {e}
                  <span className="text-right badge badge-primary">{invoiceCount}</span>
                </li>
              )
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
            <div className="w-100 cursor-pointer" data-toggle="collapse" data-target={`#invoice-body-${random_id}`}>
              <span className="step font-special">{ toInitials(invoice.user.name)}</span>
              { invoice.user.name } - {invoice.billing_date} - {toCurrency(invoice.total_billing)}
            </div>
            <div className="collapse w-100 mt-2" id={`invoice-body-${random_id}`}>
              <hr />
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
