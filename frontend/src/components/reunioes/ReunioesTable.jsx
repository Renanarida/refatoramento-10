// src/components/reunioes/ReunioesTable.jsx
import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import {
  Paper, Box, Grid, TextField, Select, MenuItem, InputLabel, FormControl,
  Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TableSortLabel, Typography, Pagination, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Card, CardHeader, CardContent, Chip, Avatar, Stack,
  IconButton, Tooltip, Snackbar, Link
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const EV_SALVA = "reuniao:salva";
const normalizeCpf = (v = "") => String(v).replace(/\D+/g, "");

function ModalParticipantes({ open, onClose, reuniao, loading, error, participantes }) {
  const onlyDigits = (v = "") => String(v).replace(/\D/g, "");

  const fmtCpf = (v = "") => {
    const d = onlyDigits(v).slice(0, 11);
    if (!d) return "—";
    const p1 = d.slice(0, 3), p2 = d.slice(3, 6), p3 = d.slice(6, 9), p4 = d.slice(9, 11);
    return [p1, p2, p3].filter(Boolean).join(".") + (p4 ? "-" + p4 : "");
  };

  const fmtTelDisplay = (v = "") => {
    const d = onlyDigits(v);
    if (!d) return "—";
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return v || "—";
  };

  const waUrl = (v = "") => {
    const d = onlyDigits(v);
    if (!d) return null;
    const withDDI = d.length >= 12 ? d : `55${d}`;
    return `https://wa.me/${withDDI}`;
  };

  const initial = (nome = "") => (nome?.trim?.()[0] || "?").toUpperCase();

  // snackbar "CPF copiado"
  const [copied, setCopied] = useState(false);
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Participantes — {reuniao?.titulo ?? ""}</DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Typography variant="body2" color="text.secondary">Carregando…</Typography>
        ) : !participantes?.length ? (
          <Typography variant="body2" color="text.secondary">Sem participantes.</Typography>
        ) : (
          <Grid container spacing={2}>
            {participantes.map((p) => {
              const cpfDigits = onlyDigits(p?.cpf ?? "");
              const cpfFmt = fmtCpf(p?.cpf ?? "");
              const telFmt = fmtTelDisplay(p?.telefone ?? "");
              const wa = waUrl(p?.telefone ?? "");

              // 🔹 tenta várias chaves (e também dentro de pivot)
              const cargo =
                p?.cargo ??
                p?.profissao ??
                p?.papel ??
                p?.funcao ??
                p?.role ??
                p?.job_title ??
                p?.ocupacao ??
                p?.pivot?.cargo ??
                p?.pivot?.profissao ??
                p?.pivot?.papel ??
                p?.pivot?.funcao ??
                "—";

              const email = p?.email ?? p?.pivot?.email ?? "—";

              return (
                <Grid item xs={12} sm={6} md={4} key={p?.id ?? cpfDigits ?? p?.nome ?? Math.random()}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardHeader
                      avatar={<Avatar>{initial(p?.nome)}</Avatar>}
                      title={p?.nome || "—"}
                      // subheader com email + Papel:
                      subheader={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {email}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Papel:</strong> {cargo}
                          </Typography>
                        </>
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Stack spacing={1.25}>
                        {/* CPF */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">CPF</Typography>
                          <Chip size="small" label={cpfFmt} />
                          {cpfDigits && (
                            <Tooltip title="Copiar CPF">
                              <IconButton size="small" onClick={() => copyText(cpfDigits)} aria-label="copiar cpf">
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>

                        {/* Telefone */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">Telefone</Typography>
                          <Typography variant="body2">{telFmt}</Typography>
                          {wa && (
                            <Tooltip title="Abrir WhatsApp">
                              <IconButton
                                size="small"
                                component={Link}
                                href={wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="whatsapp"
                              >
                                <WhatsAppIcon fontSize="inherit" color="success" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="CPF copiado"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Dialog>
  );
}

export default function ReunioesTable({ onNova, onEditar, refreshTick }) {
  const { isAdmin, isUser, isParticipant } = useAuth();

  // filtros / estado
  const [q, setQ] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [itens, setItens] = useState([]);

  // ordenação
  const [sortKey, setSortKey] = useState("data");     // ajuste ao seu padrão
  const [sortDir, setSortDir] = useState("asc");

  // modal participantes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReuniao, setModalReuniao] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalParticipantes, setModalParticipantes] = useState([]);

  const showActions = isAdmin || isUser || isParticipant;

  const ordenar = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const itensOrdenados = useMemo(() => {
    const arr = Array.isArray(itens) ? [...itens] : [];
    arr.sort((a, b) => {
      const A = (a?.[sortKey] ?? "").toString();
      const B = (b?.[sortKey] ?? "").toString();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [itens, sortKey, sortDir]);

  // fetch
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        let endpoint = "/reunioes";
        if (isParticipant) endpoint = "/participante/reunioes";

        // envia CPF no header quando modo participante
        if (isParticipant) {
          const cpf = localStorage.getItem("cpf");
          if (cpf) API.defaults.headers["X-CPF"] = normalizeCpf(cpf);
        }

        const { data } = await API.get(endpoint, {
          params: {
            q: q || undefined,
            data_ini: dataIni || undefined,
            data_fim: dataFim || undefined,
            page, per_page: perPage,
          },
        });

        if (!alive) return;
        const rows = Array.isArray(data) ? data : (data?.data ?? []);
        setItens(rows);
        setTotal(data?.total ?? rows.length);
        setLastPage(data?.last_page ?? 1);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Erro ao carregar reuniões.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [q, dataIni, dataFim, page, perPage, refreshTick, isParticipant]);

  const excluir = async (id) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await API.delete(`/reunioes/${id}`);
    window.dispatchEvent(new Event(EV_SALVA));
    // força refresh
    setPage(1);
  };

  const abrirModalParticipantes = async (reuniao) => {
    setModalOpen(true);
    setModalReuniao(reuniao);
    setModalLoading(true);
    setModalError(null);
    setModalParticipantes([]);

    try {
      if (isParticipant) {
        const cpf = localStorage.getItem("cpf");
        if (!cpf) throw new Error("Informe seu CPF para listar suas reuniões.");
        const { data } = await API.get(`/participante/reunioes`, { params: { cpf: normalizeCpf(cpf) } });
        setModalParticipantes(Array.isArray(data?.participantes) ? data.participantes : []);
      } else {
        const { data } = await API.get(`/reunioes/${reuniao.id}`);
        setModalParticipantes(Array.isArray(data?.participantes) ? data.participantes : []);
      }
    } catch (e) {
      setModalError(e?.response?.data?.message || e?.message || "Erro ao carregar participantes.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      {/* Filtros / Ações */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth size="small" variant="outlined"
            placeholder="Título/descrição…"
            value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="De" type="date" size="small" fullWidth
            value={dataIni} onChange={(e) => { setPage(1); setDataIni(e.target.value); }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="Até" type="date" size="small" fullWidth
            value={dataFim} onChange={(e) => { setPage(1); setDataFim(e.target.value); }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="perpage-label">Por página</InputLabel>
            <Select
              labelId="perpage-label" label="Por página"
              value={perPage}
              onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)); }}
            >
              {[5,10,25,50].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        {isAdmin && (
          <Grid item xs={6} md={2} sx={{ textAlign: { md: "right" } }}>
            <Button variant="contained" onClick={onNova}>Cadastrar</Button>
          </Grid>
        )}
      </Grid>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* Tabela */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortKey === "titulo" ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === "titulo"}
                  direction={sortKey === "titulo" ? sortDir : "asc"}
                  onClick={() => ordenar("titulo")}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell sortDirection={sortKey === "data" ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === "data"}
                  direction={sortKey === "data" ? sortDir : "asc"}
                  onClick={() => ordenar("data")}
                >
                  Data
                </TableSortLabel>
              </TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Local</TableCell>
              {showActions && <TableCell align="right">Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {(!loading && itensOrdenados.length === 0) && (
              <TableRow>
                <TableCell colSpan={showActions ? 6 : 5} align="center">
                  <Typography variant="body2" color="text.secondary">Nenhuma reunião encontrada.</Typography>
                </TableCell>
              </TableRow>
            )}
            {itensOrdenados.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.titulo}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={r.descricao || ""}>
                    {r.descricao || "-"}
                  </Typography>
                </TableCell>
                <TableCell>{r.data || ""}</TableCell>
                <TableCell>{r.hora || ""}</TableCell>
                <TableCell>{r.local || ""}</TableCell>
                {showActions && (
                  <TableCell align="right">
                    {isAdmin && (
                      <>
                        <Button size="small" variant="contained" color="warning" onClick={() => onEditar(r)}>
                          Editar
                        </Button>
                        <Button size="small" variant="contained" color="error" onClick={() => excluir(r.id)} sx={{ ml: 1 }}>
                          Excluir
                        </Button>
                      </>
                    )}
                    {(isAdmin || isUser || isParticipant) && (
                      <Button size="small" variant="outlined" onClick={() => abrirModalParticipantes(r)} sx={{ ml: isAdmin ? 1 : 0 }}>
                        Participantes
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination
          color="primary"
          page={page}
          count={lastPage || 1}
          onChange={(_, value) => setPage(value)}
        />
      </Box>

      {/* Modal Participantes */}
      <ModalParticipantes
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reuniao={modalReuniao}
        loading={modalLoading}
        error={modalError}
        participantes={modalParticipantes}
      />
    </Paper>
  );
}
