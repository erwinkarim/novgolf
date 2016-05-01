var PriceScheduleItems = React.createClass({
  render: function(){
    var createItem = function(item){
      return <li className="list-group-item">{item}</li>;
    }
    return <div>{this.props.items.map(createItem)}</div>;
  }
});

var PriceScheduleSetting = React.createClass({
  getInitialState: function(){
    return { items:[] };
  },
  componentDidMount: function(){
    console.log('mounted');
  },
  handleClick: function(){
    console.log('button clicked');
    var nextItem = this.state.items.concat(Math.random());
    this.setState({items:nextItem});
  },
  render: function() {
    return (
      <div>
        <PriceScheduleItems items={this.state.items} />
        <li className="list-group-item">
          <button type='button' className='btn btn-secondary' onClick={this.handleClick}>
            <i className='fa fa-plus'></i>
          </button>
        </li>
      </div>
    );
  }
});
