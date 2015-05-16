var Kefir = require("kefir");
var React = require("react");

/* COURIER */

/* Courier services are defined as Kefir pools so that we can plug in streams
 * and properties dynamically from the UI and the transition function. The
 * courier composes a network of streams which results in a single messages
 * stream to be used together with the transition function to generate the
 * state property. */

var services = {};
services.hash = Kefir.pool();
services.add = Kefir.pool();
services.reset = Kefir.pool();

messages = Kefir.merge(
    [ services.add.map(function() { return { type: "add" }; })
    , services.reset.debounce(1000).map(function() { return { type: "reset" }; })
    , services.hash.map(function(hash) { return { type: "hash", hash: hash }; })
    ]).log("MESSAGE");

/* STATE TRANSITION */

/* The transition function defines how the application progresses. It takes the
 * previous state, initially initState, and a message and produces the state
 * property. */

var initState = { count: 0, hash: "0" };
function transition(state, message) {

    switch (message.type) {
        case "add":
            services.reset.plug(Kefir.constant(true));
            return { count: state.count + 1, hash: Number(state.count + 1).toString() }; break;
        case "reset":
            return initState; break;
        case "hash":

            /* In a realistic application you would use a routing library to
             * parse the hash (or URL if using History API) and perform the
             * appropriate state transition based on that. */

            var count = parseInt(message.hash);
            if (count !== 0) services.reset.plug(Kefir.constant(true));
            if (isNaN(count)) return state; // Reject hash change
            return { count: count, hash: message.hash };
            break;
        default:
            return state;
    }
};

/* UI */

/* The user interface is a React component which gets the courier services and
 * the states property as props. It subscribes to the states property so it can
 * update its internal state whenever the application state changes. It sends
 * interactions to the courier services based on user interaction events. */

var UI = React.createClass({
    componentWillMount: function() {

        /* Since states is a Kefir property, onValue will fire synchronously
         * with the initial state which means we don't need getInitialState. */

        this.props.states.onValue(this.setState.bind(this));

        /* There is nothing stopping subcomponents from managing their own
         * state, but only if that state is truly local to that component. If
         * the state is used by parent or sibling components, it should be
         * handled in the state transition function. */
    },
    add: function(event) {

        /* When the UI captures the click event it sends an instruction to the
         * courier's add service, which will result in a message, a state
         * transition, and a .setState call. */

        this.props.services.add.plug(Kefir.constant(true));
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

/* URL */

function initHash(hashService, hashStates) {

    /* NOTE: This function would not be written from scratch in each
     * application, but provided by a library as it is not domain specific. */
     
    /* This function sets up basic URL hash handling, allowing us to treat hash
     * changes just like other UI changes in the transition function and the
     * courier. A more advanced version could use the History API to implement
     * similar functionality.
     *
     * We make sure the state's hash is reflected in the browser and we send
     * instructions to the courier's hash service for hash changes triggered by
     * the user or browser so the transition function can handle them.
     *
     * You should think of the browser address bar as a special UI component
     * that renders itself based on the state's hash property and produces
     * instructions for the courier's hash service when the user changes it. */

    /* muteNext mutes the next hashchange event and is used to avoid an
     * instruction for state transition induced hash changes. */

    var muteNext = false;
    function mute() {
        if (muteNext) {
            muteNext = false;
            return false;
        } else {
            return true;
        }
    };

    function getHash() { return window.location.hash.replace(/^#/, ""); }
    function setHash(hash) {
        muteNext = (hash !== getHash());
        window.location.hash = hash;
    }

    hashService.plug(Kefir.fromEvents(window, "hashchange", getHash).filter(mute));

    /* To keep the initState and transition function unifrom we send the
     * initial browser hash as a normal instruction. To achieve this, we first
     * handle the initialHash. If it's empty we set the hash to the hash
     * specified in the initial state, otherwise we send the hash to the
     * courier's hash service so it can be handled by the transition function.
     * 
     * Because of how Kefir manages activation/deactivation, we set up the skip
     * subscriber first so that hashService stays activated (we assume
     * hashStates is a function of hashService). */

    hashStates.skip(1).onValue(setHash);
    hashStates.take(1).onValue(function (initHash) {
        var hash = getHash();
        if (hash === "") { setHash(initHash); }
        else { hashService.plug(Kefir.constant(hash)); }
    });
};

/* INITIALIZATION */

/* Fold (scan in Kefir parlance) messages with the transition function to
 * produce a states property. */

var states = messages.scan(transition, initState);

/* Initialize hash handling by passing the courier's hash service and a state
 * hash property. */

initHash(services.hash, states.map(function(s) { return s.hash; }));

/* Initialize the UI by using React's render function, passing the courier's
 * services and the states property as props. */

React.render(<UI services={services} states={states} />,
             document.getElementById('app'));
