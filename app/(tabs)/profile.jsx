import { View, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import { getUserPosts, signOut } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons } from "../../constants";
import InforBox from "../../components/InforBox";
import { router } from "expo-router";

const Profile = () => {
    const { user, setUser, setIsLoggedIn } = useGlobalContext();
    const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

    const logout = async () => {
        await signOut();
        setUser(null);
        setIsLoggedIn(false);
        router.replace("/sign-in");
    };
    return (
        <SafeAreaView className="bg-primary border-2 h-full">
            <FlatList
                data={posts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => {
                    return <VideoCard video={item} />;
                }}
                ListHeaderComponent={() => {
                    return (
                        <View className="w-full justify-center items-center mt-6 mb-12 px-4">
                            <TouchableOpacity className="w-full items-end mb-10" onPress={logout}>
                                <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
                            </TouchableOpacity>
                            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
                                <Image
                                    source={{ uri: user?.avatar }}
                                    className="w-[90%] h-[90%] rounded-lg"
                                    resizeMode="cover"
                                />
                            </View>
                            <InforBox title={user?.username} containerStyles="mt-5" titleStyles="text-lg" />
                            <View className=" flex-row">
                                <InforBox
                                    title={posts.length || 0}
                                    subtitle="Posts"
                                    containerStyles="mr-10"
                                    titleStyles="text-xl"
                                />
                                <InforBox title="1.2k" subtitle="Views" titleStyles="text-xl" />
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={() => (
                    <EmptyState title="No Videos Found" subtitle="No video found for this profile" />
                )}
            />
        </SafeAreaView>
    );
};

export default Profile;
