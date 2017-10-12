let React    = require('react');
let ReactDOM = require('react-dom');
let Relay    = require('react-relay');

class Item extends React.Component {
  render() {
    let item = this.props.store;

    return (
      <div>
        <h1><a href={item.url}>{item.title}</a></h1>
        <h2>{item.score} - {item.by.id}</h2>
        <hr />
      </div>
    );
  }
};

// re-defines my Item component as a new component which wraps the original
// for the component’s “store” prop, fetch the data described on the HackerNewsAPI object in this GraphQL fragment
Item = Relay.createContainer(Item, {
  fragments: {
    store: () => Relay.QL`
      fragment on HackerNewsItem {
        id
        title,
        score,
        url
        by {
          id
        }
      }
    `,
  },
});

class HackerNewsRoute extends Relay.Route {
  static routeName = 'HackerNewsRoute';
  static queries = {
    store: ((Component) => {
      // Component is the Item
      return Relay.QL`
      query root {
        hn { ${Component.getFragment('store')} },
      }
    `}),
  };
}

class TopItems extends React.Component {
  _onChange(ev) {
    let storyType = ev.target.value;
    this.setState({ storyType });
    this.props.relay.setVariables({
      storyType
    });
  }
  
  render() {
    let items = this.props.store.topStories.map(
      (store, idx) => <Item store={store} key={idx} />
    );

    let variables = this.props.relay.variables;

    // To reduce the perceived lag
    // There are less crude ways of doing this, but this works for now
    let currentStoryType = (this.state && this.state.storyType) || variables.storyType;

    return <div>
      <select onChange={this._onChange.bind(this)} value={currentStoryType}>
        <option value="top">Top</option>
        <option value="new">New</option>
        <option value="ask">Ask HN</option>
        <option value="show">Show HN</option>
      </select>
      { items }
    </div>;
  }
}

TopItems = Relay.createContainer(TopItems, {
  initialVariables: {
    storyType: "top"
  },
  fragments: {
    store: () => Relay.QL`
      fragment on HackerNewsAPI {
        stories(storyType: $storyType) { ${Item.getFragment('store')} },
      }
    `,
  },
});

// let item = {
//   id  : '1337',
//   url : 'http://google.com',
//   title : 'Google',
//   score : 100,
//   by : { id : 'clay '}
// };
// let store = { item };
// let rootComponent = <Item store={store} />;

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('https://www.GraphQLHub.com/graphql')
);

let mountNode = document.getElementById('container');
let rootComponent = <Relay.RootContainer
  Component={TopItems}
  route={new HackerNewsRoute()} />;

ReactDOM.render(rootComponent, mountNode);
