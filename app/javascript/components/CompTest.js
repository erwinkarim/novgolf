var React = require("react")

console.log('test');

/*
var CompTest = React.createClass({

  render: function() {
    return (<div>CompTest here</div>);
  }
});
*/

class CompTest extends React.Component {

  render(){
    return <div>test</div>;
  }
};

module.exports = CompTest
