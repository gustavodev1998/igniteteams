import { useState, useEffect, useRef } from "react";
import { Alert, FlatList, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Container, Form, HeaderList, NumbersOfPlayers } from "./styles";

import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Filter } from "@components/Filter";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { playersGetByGroup } from "@storage/player/playersGetByGroup";
import { playersGetByGroupAndTeam } from "@storage/player/playerGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupDeleteByName } from "@storage/group/groupDeleteByName";
import { Loading } from "@components/Loading";

type RouteParams = {
  group: string;
};

export function Players() {
  const [isLoading, setIsLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [team, setTeam] = useState("Time A");
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

  const route = useRoute();
  const params = route.params as RouteParams;

  const navigation = useNavigation();

  const newPlayerNameInputRef = useRef<TextInput>(null);

  async function handleAddPlayer() {
    if (newPlayerName.trim().length === 0) {
      return Alert.alert("Novo Jogador", "Informe o nome do jogador");
    }

    const newPlayer = {
      name: newPlayerName,
      team: team,
    };

    try {
      await playerAddByGroup(newPlayer, params.group);
      newPlayerNameInputRef.current?.blur();
      setNewPlayerName("");
      fetchPlayersByTeam();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Novo Jogador", error.message);
      } else {
        console.log(error);
        Alert.alert("Novo Jogador", "Não foi possível adicionar o jogador");
      }
    }
  }

  async function fetchPlayersByTeam() {
    try {
      setIsLoading(true);

      const playerByTeam = await playersGetByGroupAndTeam(params.group, team);

      setPlayers(playerByTeam);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Jogadores",
        "Não foi possível carregar os jogadores do time selecionado"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemovePlayer(playerName: string) {
    try {
      await playerRemoveByGroup(playerName, params.group);
      fetchPlayersByTeam();
    } catch (error) {
      Alert.alert("Remover Jogador", "Não foi possível remover o jogador");
    }
  }

  async function groupDelete(groupName: string) {
    try {
      await groupDeleteByName(groupName);
      navigation.navigate("groups");
    } catch (error) {
      Alert.alert("Remover Grupo", "Não foi possível eliminar o grupo");
    }
  }

  async function handleDeleteGroup() {
    Alert.alert("Remover", "Deseja realmente remover a turma?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () => {
          groupDelete(params.group);
        },
      },
    ]);
  }

  useEffect(() => {
    fetchPlayersByTeam();
  }, [team]);

  return (
    <Container>
      <Header showBackButton />

      <Highlight
        title={params.group}
        subtitle="adicione a galera e separe os times"
      />

      <Form>
        <Input
          placeholder="Nome da pessoa"
          autoCorrect={false}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          inputRef={newPlayerNameInputRef}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />
        <ButtonIcon icon="add" onPress={handleAddPlayer} />
      </Form>

      <HeaderList>
        <FlatList
          data={["Time A", "Time B"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />

        <NumbersOfPlayers>{players.length}</NumbersOfPlayers>
      </HeaderList>

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <PlayerCard
              name={item.name}
              onRemove={() => {
                handleRemovePlayer(item.name);
              }}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmpty message="Não há pessoas nesse time." />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingBottom: 100 },
            players.length === 0 && { flex: 1 },
          ]}
        />
      )}
      <Button
        title="Remover turma"
        type="SECONDARY"
        onPress={() => {
          handleDeleteGroup();
        }}
      />
    </Container>
  );
}
