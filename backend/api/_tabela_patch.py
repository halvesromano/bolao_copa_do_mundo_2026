

class TabelaGruposViewSet(viewsets.ViewSet):
    """Calcula a tabela de classificação de um grupo da fase de grupos."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request):
        grupo_letra = request.query_params.get('grupo', '').upper()
        if not grupo_letra:
            return Response({'error': 'Forneça o parâmetro ?grupo=A'}, status=status.HTTP_400_BAD_REQUEST)

        fase_nome = f"Grupo {grupo_letra}"

        # Busca todos os jogos desse grupo, encerrados ou não
        jogos = Jogo.objects.filter(
            fase__nome=fase_nome,
            fase__is_mata_mata=False
        ).select_related('time_casa', 'time_fora', 'fase')

        # Inicializa dict de stats por time
        tabela = {}

        def get_time(time):
            if time.id not in tabela:
                tabela[time.id] = {
                    'id': time.id,
                    'nome': time.nome,
                    'sigla': time.sigla,
                    'bandeira_svg': time.bandeira_svg or '',
                    'pj': 0, 'v': 0, 'e': 0, 'd': 0,
                    'gm': 0, 'gs': 0, 'sg': 0, 'pts': 0,
                }
            return tabela[time.id]

        # Pré-registra todos os times mesmo sem jogos encerrados
        for jogo in jogos:
            get_time(jogo.time_casa)
            get_time(jogo.time_fora)

        # Calcula stats apenas dos jogos encerrados
        jogos_encerrados = [j for j in jogos if j.encerrado and j.gol_casa is not None]

        for jogo in jogos_encerrados:
            tc = get_time(jogo.time_casa)
            tf = get_time(jogo.time_fora)
            gc, gf = jogo.gol_casa, jogo.gol_fora

            tc['pj'] += 1; tf['pj'] += 1
            tc['gm'] += gc; tc['gs'] += gf
            tf['gm'] += gf; tf['gs'] += gc
            tc['sg'] = tc['gm'] - tc['gs']
            tf['sg'] = tf['gm'] - tf['gs']

            if gc > gf:
                tc['v'] += 1; tf['d'] += 1
                tc['pts'] += 3
            elif gc < gf:
                tf['v'] += 1; tc['d'] += 1
                tf['pts'] += 3
            else:
                tc['e'] += 1; tf['e'] += 1
                tc['pts'] += 1; tf['pts'] += 1

        times_lista = list(tabela.values())

        def confronto_direto(t1_id, t2_id):
            """Retorna 1 se t1 venceu o confronto, -1 se t2 venceu, 0 empate/sem jogo."""
            for j in jogos_encerrados:
                if j.time_casa.id == t1_id and j.time_fora.id == t2_id:
                    if j.gol_casa > j.gol_fora: return 1
                    if j.gol_casa < j.gol_fora: return -1
                    return 0
                if j.time_casa.id == t2_id and j.time_fora.id == t1_id:
                    if j.gol_fora > j.gol_casa: return 1
                    if j.gol_fora < j.gol_casa: return -1
                    return 0
            return 0  # Sem confronto ainda

        def cmp(a, b):
            # 1) Pontos
            if a['pts'] != b['pts']: return b['pts'] - a['pts']
            # 2) Saldo de gols
            if a['sg'] != b['sg']: return b['sg'] - a['sg']
            # 3) Gols marcados
            if a['gm'] != b['gm']: return b['gm'] - a['gm']
            # 4) Confronto direto (apenas entre 2 equipes)
            cd = confronto_direto(a['id'], b['id'])
            if cd == 1: return -1
            if cd == -1: return 1
            return 0

        import functools
        times_lista.sort(key=functools.cmp_to_key(cmp))

        # Adiciona posição
        for i, t in enumerate(times_lista):
            t['pos'] = i + 1

        return Response({'grupo': grupo_letra, 'times': times_lista})
