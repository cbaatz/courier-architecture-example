var Kefir = require("kefir");
var React = require("react");

courier = {};
courier.add = Kefir.pool();
courier.reset = Kefir.pool();
courier.messages = Kefir.merge(
    [ courier.add.map(function() { return "add"; })
    , courier.reset.debounce(750).map(function() { return "reset"; })
    ]);

var initState = { count: 0 };
function transition(state, message) {
    switch (message) {
        case "add":
            courier.reset.plug(Kefir.constant(true));
            return { count: state.count + 1 }; break;
        case "reset":
            return initState; break;
        default:
            return state;
    }
};

var UI = React.createClass({
    componentWillMount: function() {
        /* Since states is a Kefir property, onValue will fire
           synchronously with the initial state which means we
           don't need getInitialState. */
        this.props.states.onValue(this.setState.bind(this));
    },
    add: function(event) {
        this.props.courier.add.plug(Kefir.constant(true));
    },
    render: function() {
        return (
            <div>
                <button onClick={this.add}>Click, quickly!</button>
                <p>You are {this.state.count} clicks ahead.</p>
            </div>
        );
    }
});

var states = courier.messages.scan(transition, initState);
React.render(<UI courier={courier} states={states} />,
             document.getElementById('app'));
