const {ApolloServer, gql} = require('apollo-server');
const { KafkaPubSub } = require('graphql-kafka-subscriptions')

const pubsub = new KafkaPubSub({
    topic: 'issue-certificate',
    host: 'localhost',
    port: '9092'
})

const typeDefs = gql`
    type Book {
        title: String
        author: String
    }

    type Author {
        books: [Book]
    }

    type Query {
        author: Author
        books: [Book]
        posts: [Post]
    }

    type Subscription {
        postAdded: Post
    }

    type Mutation {
        addPost(author: String, comment: String): Post
    }

    type Post {
        author: String
        comment: String
    }
`;

const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];

const POST_ADDED = 'POST_ADDED';

const resolvers = {
    Subscription: {
        postAdded: {
            subscribe: () => pubsub.asyncIterator([POST_ADDED])
        },
    },
    Query: {
        books: () => books,
    },
    Mutation: {
        addPost(root, args, context) {
            pubsub.publish({channel: POST_ADDED, postAdded: args});
        },
    }
};

pubsub.subscribe(POST_ADDED, (x) => console.log('aaaaaaa', x))

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});