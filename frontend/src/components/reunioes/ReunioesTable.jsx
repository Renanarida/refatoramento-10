import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import {
  Card, CardHeader, CardBody, CardFooter,
  Heading, Text,
  Stack, HStack, VStack,
  Input, InputGroup, InputLeftElement,
  Select, Button,
  Table, Thead, Tbody, Tr, Th, Td,
  Alert, AlertIcon, Spinner, Tag,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  SimpleGrid, Box, useToast
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi"; // ✅ usando react-icons

const EV_SALVA = "reuniao:salva";

function normalizeCpf(v = "") {
  return String(v).replace(/\D+/g, "");
}

function ModalParticipantes({ open, onClose, reuniao, loading, error, participantes }) {
  return (
    <Modal isOpen={open} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Participantes {reuniao ? `— ${reuniao.titulo ?? ""}` : ""}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading && (
            <HStack py={6} justify="center">
              <Spinner /> <Text>Carregando…</Text>
            </HStack>
          )}
          {error && !loading && (
            <Alert status="error" mb={4}><AlertIcon />{error}</Alert>
          )}
          {!loading && !error && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {Array.isArray(participantes) && participantes.length > 0 ? (
                participantes.map((p) => (
                  <Card key={p.id ?? `${p.nome}-${p.email}-${p.papel}`} variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{p.nome || "(sem nome)"}</Text>
                        <Text fontSize="sm" color="gray.500">{p.email || "-"}</Text>
                        <Tag mt={2} colorScheme="brand">{p.papel || "participante"}</Tag>
                      </VStack>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <Box py={3} color="gray.500">Nenhum participante encontrado.</Box>
              )}
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ReunioesTable({
  onNova = () => {},
  onEditar = () => {},
  refreshTick = 0,
}) {
  const { mode } = useAuth();
  const isAdmin = mode === "admin";
  const isParticipant = mode === "participant";
  const isUser = mode === "user";

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [sortKey, setSortKey] = useState("data");
  const [sortDir, setSortDir] = useState("asc");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalParticipantes, setModalParticipantes] = useState([]);
  const [modalReuniao, setModalReuniao] = useState(null);

  const toast = useToast();

  const endpoint =
    isAdmin || isUser
      ? "/reunioes"
      : isParticipant
      ? "/participante/reunioes"
      : "/public/reunioes";

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (isParticipant) {
        const cpf = localStorage.getItem("cpf");
        if (cpf) API.defaults.headers["X-CPF"] = cpf;
      }

      const { data } = await API.get(endpoint, {
        params: {
          q: q || undefined,
          data_ini: dataIni || undefined,
          data_fim: dataFim || undefined,
          page,
          per_page: perPage,
        },
      });

      const rows = Array.isArray(data) ? data : data.data ?? [];
      const lp = data?.meta?.last_page ?? data?.last_page ?? 1;
      const tt = data?.meta?.total ?? data?.total ?? rows.length ?? 0;

      setItens(rows);
      setTotal(tt);
      setLastPage(lp);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dataIni, dataFim, page, perPage, refreshTick, endpoint, mode]);

  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchData();
    };
    window.addEventListener(EV_SALVA, handler);
    return () => window.removeEventListener(EV_SALVA, handler);
  }, []);

  const ordenar = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const itensOrdenados = useMemo(() => {
    const arr = [...itens];
    arr.sort((a, b) => {
      const va = a?.[sortKey];
      const vb = b?.[sortKey];

      if (sortKey === "data") {
        const da = va ? new Date(va) : new Date(0);
        const db = vb ? new Date(vb) : new Date(0);
        return sortDir === "asc" ? da - db : db - da;
      }
      if (sortKey === "hora") {
        const toMin = (h) => {
          if (!h) return -1;
          const [H = "0", M = "0"] = String(h).split(":");
          return parseInt(H, 10) * 60 + parseInt(M, 10);
        };
        const ha = toMin(va);
        const hb = toMin(vb);
        return sortDir === "asc" ? ha - hb : hb - ha;
      }

      const sva = (va ?? "") + "";
      const svb = (vb ?? "") + "";
      if (sva < svb) return sortDir === "asc" ? -1 : 1;
      if (sva > svb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [itens, sortKey, sortDir]);

  const excluir = async (id) => {
    if (!isAdmin) {
      toast({ title: "Permitido apenas para administradores.", status: "warning" });
      return;
    }
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    try {
      await API.delete(`/reunioes/${id}`);
      fetchData();
      toast({ title: "Reunião excluída.", status: "success" });
    } catch (e) {
      toast({
        title: "Erro ao excluir",
        description: e?.response?.data?.message || e.message,
        status: "error",
      });
    }
  };

  const headerSort = (key, label) => (
    <Th
      onClick={() => ordenar(key)}
      title="Clique para ordenar"
      cursor="pointer"
      whiteSpace="nowrap"
      userSelect="none"
    >
      {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
    </Th>
  );

  // Abre modal e busca participantes conforme o modo
  const abrirParticipantes = async (reuniao) => {
    setModalReuniao(reuniao);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalParticipantes([]);

    try {
      if (isParticipant) {
        const cpfRaw =
          localStorage.getItem("participant_cpf") ||
          localStorage.getItem("cpf") ||
          localStorage.getItem("participantCpf");
        const cpf = cpfRaw ? normalizeCpf(cpfRaw) : null;

        const { data } = await API.get(
          `/reunioes/${reuniao.id}/participantes-by-cpf`,
          { params: { cpf } }
        );
        setModalParticipantes(data?.participantes ?? []);
      } else {
        const { data } = await API.get(`/reunioes/${reuniao.id}`);
        const participantes = Array.isArray(data?.participantes) ? data.participantes : [];
        setModalParticipantes(participantes);
        setModalReuniao((prev) => ({ ...(prev || {}), titulo: data?.titulo ?? prev?.titulo }));
      }
    } catch (e) {
      setModalError(e?.response?.data?.message || e.message || "Erro ao carregar participantes");
    } finally {
      setModalLoading(false);
    }
  };

  const showActions = isAdmin || isUser || isParticipant;

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardHeader>
        <VStack align="stretch" spacing={4}>
          <Heading size="md" textAlign="center">Reuniões</Heading>

          <Stack direction={{ base: "column", md: "row" }} spacing={3} align="end">
            <Box flex="1" />

            <InputGroup maxW="320px">
              <InputLeftElement pointerEvents="none">
                <FiSearch /> {/* ✅ trocado aqui */}
              </InputLeftElement>
              <Input
                placeholder="Título/descrição…"
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
              />
            </InputGroup>

            <Input
              type="date"
              value={dataIni}
              onChange={(e) => { setPage(1); setDataIni(e.target.value); }}
              maxW="180px"
            />
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => { setPage(1); setDataFim(e.target.value); }}
              maxW="180px"
            />

            <Select
              value={perPage}
              onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)); }}
              maxW="140px"
            >
              {[5,10,25,50].map(n => <option key={n} value={n}>{n}/página</option>)}
            </Select>

            {isAdmin && (
              <Button onClick={onNova} colorScheme="brand">Cadastrar</Button>
            )}
          </Stack>
        </VStack>
      </CardHeader>

      <CardBody p={0}>
        {loading && (
          <HStack justify="center" py={8} color="gray.400">
            <Spinner /> <Text>Carregando…</Text>
          </HStack>
        )}
        {err && !loading && (
          <Box p={4}>
            <Alert status="error"><AlertIcon />Erro ao carregar: {String(err)}</Alert>
          </Box>
        )}
        {!loading && !err && (
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  {headerSort("titulo", "Título")}
                  {headerSort("descricao", "Descrição")}
                  {headerSort("data", "Data")}
                  {headerSort("hora", "Hora")}
                  {headerSort("local", "Local")}
                  {showActions && (
                    <Th isNumeric w={isAdmin ? "220px" : "180px"}>Ações</Th>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {itensOrdenados.length === 0 ? (
                  <Tr>
                    <Td colSpan={showActions ? 6 : 5}>
                      <Text align="center" py={6} color="gray.500">Nenhuma reunião encontrada.</Text>
                    </Td>
                  </Tr>
                ) : (
                  itensOrdenados.map((r) => (
                    <Tr key={r.id}>
                      <Td>{r.titulo}</Td>
                      <Td>
                        <Text noOfLines={1} title={r.descricao || ""} maxW="360px">
                          {r.descricao || "-"}
                        </Text>
                      </Td>
                      <Td>{r.data || ""}</Td>
                      <Td>{r.hora || ""}</Td>
                      <Td>{r.local || ""}</Td>

                      {showActions && (
                        <Td isNumeric>
                          <HStack justify="end" spacing={2}>
                            {isAdmin && (
                              <>
                                <Button size="xs" colorScheme="yellow" onClick={() => onEditar(r)}>
                                  Editar
                                </Button>
                                <Button size="xs" colorScheme="red" onClick={() => excluir(r.id)}>
                                  Excluir
                                </Button>
                              </>
                            )}
                            {(isUser || isAdmin || isParticipant) && (
                              <Button size="xs" colorScheme="brand" onClick={() => abrirParticipantes(r)}>
                                Ver participantes
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      )}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>

      <CardFooter justify="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.500">
          {total} registro{total === 1 ? "" : "s"} • Página {page} de {lastPage}
        </Text>
        <HStack>
          <Button
            size="sm" variant="outline"
            isDisabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Anterior
          </Button>
          <Button
            size="sm" variant="outline"
            isDisabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            Próxima ›
          </Button>
        </HStack>
      </CardFooter>

      <ModalParticipantes
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reuniao={modalReuniao}
        loading={modalLoading}
        error={modalError}
        participantes={modalParticipantes}
      />
    </Card>
  );
}
