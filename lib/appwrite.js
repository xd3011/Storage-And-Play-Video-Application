import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: 'com.flash.xd',
    projectId: '66327a13000ab38a7b30',
    databaseId: '66327a44003c2e39c80d',
    userCollectionId: '66327a4e002610c65ec7',
    videoColelctionId: '66327a54000a910c7fb7',
    storageId: '66327a48002dff45289e',
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoColelctionId,
    storageId,
} = config;

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (username, email, password) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw new Error;
        const avatarUrl = avatars.getInitials(username);
        await signIn(email, password);

        const newUser = await databases.createDocument(databaseId, userCollectionId, ID.unique(), {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarUrl,
        })
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Sign In
export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!createUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoColelctionId, [Query.orderDesc('$createdAt')]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLastestPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoColelctionId, [Query.orderDesc('$createdAt', Query.limit(7))]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(databaseId, videoColelctionId, [Query.search('title', query)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(databaseId, videoColelctionId, [Query.equal('creator', userId)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getFilePreview = async (fileId, type) => {
    let fileUrl;
    try {
        if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100);
        }
        else if (type === 'video') {
            fileUrl = storage.getFileView(storageId, fileId);
        } else {
            throw new Error('Invalid file type');
        }
        if (!fileUrl) throw Error;
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFile = async (file, type) => {
    if (!file) return;
    const asset = { name: file.fileName, type: file.mimeType, size: file.filesize, uri: file.uri }
    try {
        const uploadedFile = await storage.createFile(storageId, ID.unique(), asset);
        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideo = async (form) => {
    try {
        const thumbnailUrl = await uploadFile(form.thumbnail, 'image');
        const videoUrl = await uploadFile(form.video, 'video')
        const newPost = await databases.createDocument(databaseId, videoColelctionId, ID.unique(), { title: form.title, thumbnail: thumbnailUrl, video: videoUrl, prompt: form.prompt, creator: form.userId });
        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}
