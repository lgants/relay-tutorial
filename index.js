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
  render() {
    let items = this.props.store.topStories.map(
      (store, idx) => <Item store={store} key={idx} />
    );
    return <div>
      { items }
    </div>;
  }
}

TopItems = Relay.createContainer(TopItems, {
  fragments: {
    store: () => Relay.QL`
      fragment on HackerNewsAPI {
        topStories { ${Item.getFragment('store')} },
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
