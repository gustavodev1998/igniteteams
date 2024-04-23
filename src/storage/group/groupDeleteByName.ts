import AsyncStorage from "@react-native-async-storage/async-storage";

import { GROUP_COLLECTION, PLAYER_COLLECTION } from "@storage/storageConfig";

import { groupsGetAll } from "./groupsGetAll";

export async function groupDeleteByName(groupName: string) {
  try {
    const storage: string[] = await groupsGetAll();

    const filteredGroups: string[] = storage.filter(
      (group) => group !== groupName
    );

    const newStorage = JSON.stringify(filteredGroups);
    await AsyncStorage.setItem(GROUP_COLLECTION, newStorage);
    await AsyncStorage.removeItem(`${PLAYER_COLLECTION}-${groupName}`);
  } catch (error) {
    throw error;
  }
}
