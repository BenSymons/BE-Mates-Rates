const graphql = require('graphql');
const City = require('../models/cities');
const Restaurant = require('../models/restaurants');
const Review = require('../models/reviews');
const User = require('../models/users');
const Friend = require('../models/friends');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLSchema,
  GraphQLInt
} = graphql;

const CityType = new GraphQLObjectType({
  name: 'City',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: { type: GraphQLString },
    restaurants: {
      type: new GraphQLList(RestaurantType),
      resolve(parent, args) {
        return Restaurant.find({ city_id: parent.id });
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID},
    name: { type: GraphQLString },
    username: { type: GraphQLString},
    avatarURL: { type: GraphQLString},
    reviews: {
      type: new GraphQLList(ReviewType),
      resolve(parent, args) {
        return Review.find({ user_id: parent.id})
      }
    },
    friends: {
      type: FriendType,
      resolve(parent, args) {
          return Friend.findById(parent.friend_id)
      }
    }
  })
});

const FriendType = new GraphQLObjectType({
  name: 'Friends',
  fields: () => ({
    id: { type: GraphQLID},
    name: { type: GraphQLInt },
    users: {
      type: new GraphQLList(UserType),
        resolve(parent, args) {
         return User.find({ friend_id: parent.id })
        }    
    }
  })
})

const ReviewType = new GraphQLObjectType({
  name: 'Review',
  fields: () => ({
      id: { type: GraphQLID},
      body:{ type: GraphQLString},
      rating: { type: GraphQLInt },
      restaurant_id: {
        type: RestaurantType,
        resolve(parent, args) {
          return Restaurant.findById(parent.restaurant_id)
        }
      },
      user_id: {
        type: UserType,
        resolve(parent, args) {
          return User.findById(parent.user_id)
        }
      }
  })
})

const RestaurantType = new GraphQLObjectType({
  name: 'Restaurant',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: { type: GraphQLString },

    cuisine: { type: GraphQLString },
    city: {
      type: CityType,
      resolve(parent, args) {
        return City.findById(parent.city_id);
      }
    },
    reviews: {
      type: new GraphQLList(ReviewType),
      resolve(parent, args) {
        return Review.find({restaurant_id: parent.id })
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    city: {
      type: CityType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return City.findById(args.id);
      }
    },
    restaurant: {
      type: RestaurantType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Restaurant.findById(args.id);
      }
    },
    cities: {
      type: new GraphQLList(CityType),
      resolve(parent, args) {
        return City.find({});
      }
    },
    restaurants: {
      type: new GraphQLList(CityType),
      resolve(parent, args) {
        return Restaurant.find({});
      }
    },
    reviews: {
      type: new GraphQLList(ReviewType),
      resolve(parent, args) {
        return Review.find({})
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({})
      }
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID}},
      resolve(parent, args) {
        return User.findById(args.id)
      }
    },
    friends: {
      type: new GraphQLList(FriendType),
      resolve(parent, args) {
        return Friend.find({})
      }
    },
    friend: {
      type: FriendType,
      args: { id: { type: GraphQLID}},
      resolve(parent, args) {
        return Friend.findById(args.id)
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addCity: {
      type: CityType,
      args: {
        name: {
          type: GraphQLString
        }
      },
      resolve(parent, args) {
        let city = new City({
          name: args.name
        });
        return city.save();
      }
    },
    addRestaurant: {
      type: RestaurantType,
      args: {
        name: {
          type: GraphQLString
        },
        cuisine: {
          type: GraphQLString
        },
        city_id: {
          type: GraphQLString
        }
      },
      resolve(parent, args) {
        let restaurant = new Restaurant({
          name: args.name,
          cuisine: args.cuisine,
          city_id: args.city_id
        });
        return restaurant.save();
      }
    },
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString},
        avatarURL: { type: GraphQLString},
        friend_id: { type: GraphQLString }
      },
      resolve(parent, args) {
        let user = new User({
          name: args.name,
          avatarURL: args.avatarURL,
          friend_id: args.friend_id
        });
        return user.save();
      }
    },
    addFriend: {
      type: FriendType,
      args: {
        name: { type: GraphQLInt }
      },
      resolve(parent, args) {
        let friend = new Friend({
          name: args.name
        });
        return friend.save();
      }
    },
    addReview: {
      type: ReviewType,
      args: {
        body: { type: GraphQLString },
        rating: { type: GraphQLInt },
        restaurant_id: { type: GraphQLString },
        user_id: { type: GraphQLString }
      },
      resolve(parent, args) {
        let review = new Review({
          body: args.body,
          rating: args.rating,
          restaurant_id: args.restaurant_id,
          user_id: args.user_id
        });
        return review.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
