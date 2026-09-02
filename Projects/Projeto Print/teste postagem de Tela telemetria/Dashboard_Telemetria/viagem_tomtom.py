#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
viagem_tomtom.py - Tempo de viagem REAL (com transito, caminhao) de cada BASE ate
suas empresas, via TomTom. Grava 'viagem.js' (window.LOGAS_VIAGEM) com:
  - viagem: { EMPRESA: horas }            -> usado no despacho do painel
  - rotas:  { EMPRESA: {base, baseLL, destLL} } -> usado no "Ver rota" (mapa) do painel

Tempo = TomTom (caminhao, transito, roteado a VEL_ROTA_KMH) + MARGEM de seguranca.

Uso:
  python viagem_tomtom.py            # calcula e grava viagem.js (ao lado deste arquivo)
  python viagem_tomtom.py --print    # so mostra na tela, nao grava
  py viagem_tomtom.py
"""
import os, sys, json, time, datetime, urllib.parse, urllib.request, urllib.error

# ----------------------------- CONFIG -----------------------------
API_KEY = "QKOjjJCpYZm3VPqrNJ321dW9Pa9d1acK"   # mantenha privado
TRAVEL_MODE = "truck"
VEL_ROTA_KMH = 80      # velocidade de ROTEAMENTO (evita NO_ROUTE_FOUND em rodovia)
MARGEM = 0.25          # folga sobre o tempo da TomTom (caminhao carregado). 0.25 = +25%

# Pontos que atendem varias baias no mesmo local:
EXTREMA_LL = (-22.879789341622573, -46.37153143232148)   # Extrema-MG (baias)
LAGARTO_LL = (-10.942275471289067, -37.664630632932656)  # Lagarto-SE (baias)

# Bases (de onde os caminhoes partem) -> coordenada + empresas atendidas.
# As CHAVES batem com os nomes usados no painel. FAZENDA CHAPADAO/UMBAUBA/SEARA
# sao so destinos de despacho (sem telemetria). SPINASSE pendente (falta coordenada).
BASES = {
  "Betim": {
    "coord": (-19.956313674094236, -44.13045441870082),
    "empresas": {
      "ALSCO":      (-19.99688525938805,  -44.04234853219335),
      "BELGO":      (-19.88015658498822,  -43.79436691246574),
      "EXTRUMINAS": (-19.784602405046915, -44.30053450924594),
      "M.PEQUI":    (-19.63405367583952,  -44.64858965619242),
      "VDL":        (-20.223776765982244, -43.80441798800982),
      "MG STEEL":   (-20.0101038138369,   -44.43642493526554),
      "VILMA":      (-19.999554235688944, -44.235817118699714),
      "G.PERDÕES":  (-21.163806206103395, -45.12207431634263),
      "JD CANADÁ":  (-20.06183436258079,  -43.98785491877735),
      "FORTLEV":    (-19.83672647219803,  -44.08215546741692),
    }},
  "Ipatinga": {
    "coord": (-19.49428141512894, -42.5641418151882),
    "empresas": {
      "FERMAG":   (-19.640920460304503, -43.19905455133256),
      "PLANALTO": (-18.832190089279514, -41.98886114088789),
      "TROPICAL": (-17.799046971057447, -41.786611987253515),
      "BARRIGÃO": (-20.247201068273977, -42.142691617280825),
    }},
  "Poços de Caldas": {
    "coord": (-21.832402609646568, -46.638100827678535),
    "empresas": {
      "ACQUION": (-21.836972399653416, -46.65197019071189),
      "BALANÇA": (-22.186699646902554, -45.84373712545687),
      "POUSO":   (-22.227004144603004, -45.939380412239686),
      "BAIA 1":  EXTREMA_LL, "BAIA 2": EXTREMA_LL, "BAIA 3": EXTREMA_LL,
    }},
  "Aracruz": {
    "coord": (-19.83892742835953, -40.0740806431825),
    "empresas": {
      "COLATINA":         (-19.536927166506434, -40.63081675380119),
      "FAZENDA CHAPADÃO": (-19.408056063696854, -40.23438228591222),
      # "SPINASSÉ": (lat, lng)  # PENDENTE: falta a coordenada
    }},
  "Rio Joanes": {
    "coord": (-12.85706473846636, -38.29688919851569),
    "empresas": {
      "BAIA 1 (LAGARTO)": LAGARTO_LL, "BAIA 2 (LAGARTO)": LAGARTO_LL,
      "UMBAÚBA": (-11.37995547438915, -37.66215708987112),
    }},
  "Cravinhos": {
    "coord": (-21.338500793014, -47.73450988499415),
    "empresas": {
      "ORLÂNDIA": (-20.71725328770959, -47.8803115828694),
    }},
  "Campo Grande": {
    "coord": (-20.492855717543165, -54.73852313179462),
    "empresas": {
      "SEARA": (-20.467447774599314, -54.71663397743636),
    }},
  "Barbacena": {
    "coord": (-21.218483045099013, -43.74357509319152),
    "empresas": {
      "AMG SP": (-21.084951701950843, -44.58957361808009),
      "DOW":    (-21.4471714105341,   -43.60857273399927),
    }},
}

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "viagem.js")

# ----------------------------- consulta TomTom -----------------------------
def tempo_viagem_h(orig, dest):
    """Tempo de viagem (horas, caminhao, transito ao vivo) + MARGEM, ou None."""
    loc = "%f,%f:%f,%f" % (orig[0], orig[1], dest[0], dest[1])
    params = urllib.parse.urlencode({
        "key": API_KEY, "traffic": "true", "travelMode": TRAVEL_MODE,
        "vehicleCommercial": "true", "vehicleMaxSpeed": str(VEL_ROTA_KMH),
        "routeType": "fastest", "computeTravelTimeFor": "all",
    })
    url = "https://api.tomtom.com/routing/1/calculateRoute/%s/json?%s" % (
        urllib.parse.quote(loc, safe=":,"), params)
    try:
        with urllib.request.urlopen(url, timeout=25) as r:
            d = json.loads(r.read().decode("utf-8"))
        s = d["routes"][0]["summary"]
        h = s["travelTimeInSeconds"] / 3600.0
        h = h * (1.0 + MARGEM)
        return round(h, 2)
    except urllib.error.HTTPError as e:
        try: body = e.read().decode("utf-8")[:200]
        except Exception: body = ""
        print("    [erro HTTP %s] %s" % (e.code, body)); return None
    except Exception as e:
        print("    [erro] %s" % e); return None

def main():
    so_print = "--print" in sys.argv
    viagem, rotas = {}, {}
    print("Calculando tempos de viagem por base [%s, TomTom + %d%% de margem]..." % (TRAVEL_MODE, MARGEM*100))
    for base_nome, info in BASES.items():
        bc = info["coord"]
        print("\n== Base %s ==" % base_nome)
        for emp, dest in info["empresas"].items():
            h = tempo_viagem_h(bc, dest)
            if h is not None:
                viagem[emp] = h
                rotas[emp] = {"base": base_nome, "baseLL": [bc[0], bc[1]], "destLL": [dest[0], dest[1]]}
                print("  %-18s %5.2f h  (%d min)" % (emp, h, round(h * 60)))
            else:
                print("  %-18s  -- falhou" % emp)
            time.sleep(0.25)

    if not viagem:
        print("\nNenhuma rota calculada (cheque a chave/internet). viagem.js nao alterado."); return

    payload = {
        "atualizado": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "modo": "%s (TomTom + %d%%)" % (TRAVEL_MODE, MARGEM*100),
        "viagem": viagem, "rotas": rotas,
    }
    js = ("/* Tempos de viagem (TomTom + %d%% de margem) - viagem_tomtom.py */\n" % (MARGEM*100) +
          "window.LOGAS_VIAGEM = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n")
    if so_print:
        print("\n--- viagem.js (preview, nao gravado) ---\n" + js); return
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(js)
    print("\nviagem.js atualizado: %s  (%d empresas, %d bases)" % (SAIDA, len(viagem), len(BASES)))

if __name__ == "__main__":
    main()
