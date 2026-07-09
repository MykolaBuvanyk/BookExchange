# Firestore structure and access rules

## Collections

### users

Stores public application profile data for Firebase Auth users.

- `id`: Firebase Auth uid
- `name`: display name
- `email`: user email
- `avatarUrl`: optional profile photo URL
- `role`: `user` or `admin`
- `createdAt`: server timestamp
- `updatedAt`: server timestamp

Regular users can create and update only their own profile. They cannot assign
the `admin` role to themselves. Admin users can manage user profile documents.

### books

Stores books available for exchange.

- `id`: Firestore document id
- `ownerId`: owner Firebase Auth uid
- `ownerName`: denormalized owner name
- `ownerEmail`: denormalized owner email
- `name`: book title
- `author`: book author
- `photoUrl`: optional cover image URL
- `searchName`: normalized title for search
- `searchAuthor`: normalized author for search
- `createdAt`: server timestamp
- `updatedAt`: server timestamp

Regular users can create, update, and delete only their own books. Admin users
can delete any book.

### exchangeRequests

Stores exchange request records.

- `id`: Firestore document id
- `bookId`: requested book id
- `bookName`: requested book title
- `ownerId`: requested book owner uid
- `ownerEmail`: requested book owner email
- `requesterId`: requester Firebase Auth uid
- `requesterName`: requester display name
- `requesterEmail`: requester email
- `requesterBookIds`: requester book ids offered for exchange
- `status`: `pending`, `sent`, or `failed`
- `createdAt`: server timestamp
- `updatedAt`: server timestamp

Users can create requests only for books owned by another user. The owner and
requester can read related requests. Admin users can update or delete requests.

## Firebase commands

```bash
npm run firebase:emulators
npm run firebase:deploy
```

`firebase:deploy` requires Firebase CLI authentication with `firebase login`.
The Firestore emulator requires Java installed and available in `PATH`.
