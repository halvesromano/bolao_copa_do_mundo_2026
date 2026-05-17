def calcular_pontuacao_palpite(palpite_casa, palpite_fora, real_casa, real_fora, is_mata_mata):
    pontos = 0

    if real_casa is None or real_fora is None:
        return 0

    # Determinar resultados
    palpite_vencedor = 'C' if palpite_casa > palpite_fora else ('F' if palpite_fora > palpite_casa else 'E')
    real_vencedor = 'C' if real_casa > real_fora else ('F' if real_fora > real_casa else 'E')

    # Placar Exato
    if palpite_casa == real_casa and palpite_fora == real_fora:
        return 10 if is_mata_mata else 7

    # Não acertou placar exato, verifica os outros critérios (acumuláveis)
    # Acertar vencedor ou empate
    if palpite_vencedor == real_vencedor:
        pontos += 3 if is_mata_mata else 2
    
    # Acertar gols de um dos times
    if palpite_casa == real_casa:
        pontos += 1
    if palpite_fora == real_fora:
        pontos += 1

    return pontos
