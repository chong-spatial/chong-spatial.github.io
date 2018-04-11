def fullData(inFile, outFile, attrs):
    with open(inFile) as inf, \
         open(outFile, 'w') as ouf:

        for l in inf:
            newl = []
            index = 0
            r = l.split(',')
            for a in r:
                '''
                if a =='?':
                    break
                else:
                    newl.append(attrs[index] + '=' + a)
                    index = index + 1
                '''
                newl.append(attrs[index] + '=' + a)
                index = index + 1
            ouf.write(','.join(newl))
   
                      
                

if __name__ == "__main__":
    attrs = [
        "MOSTYPE",

"MAANTHUI",

"MGEMOMV",

"MGEMLEEF",

"MOSHOOFD",

"MGODRK",

"MGODPR",

"MGODOV",

"MGODGE",

"MRELGE",

"MRELSA",

"MRELOV",

"MFALLEEN",

"MFGEKIND",

"MFWEKIND",

"MOPLHOOG",

"MOPLMIDD",

"MOPLLAAG",

"MBERHOOG",

"MBERZELF",

"MBERBOER",

"MBERMIDD",

"MBERARBG",

"MBERARBO",

"MSKA",

"MSKB1",

"MSKB2",

"MSKC",

"MSKD",

"MHHUUR",

"MHKOOP",

"MAUT1",

"MAUT2",

"MAUT0",

"MZFONDS",

"MZPART",

"MINKM30",

"MINK3045",

"MINK4575",

"MINK7512",

"MINK123M",

"MINKGEM",

"MKOOPKLA",

"PWAPART",

"PWABEDR",

"PWALAND",

"PPERSAUT",

"PBESAUT",

"PMOTSCO",

"PVRAAUT",

"PAANHANG",

"PTRACTOR",

"PWERKT",

"PBROM",

"PLEVEN",

"PPERSONG",

"PGEZONG",

"PWAOREG",

"PBRAND",

"PZEILPL",

"PPLEZIER",

"PFIETS",

"PINBOED",

"PBYSTAND",

"AWAPART",

"AWABEDR",

"AWALAND",

"APERSAUT",

"ABESAUT",

"AMOTSCO",

"AVRAAUT",

"AAANHANG",

"ATRACTOR",

"AWERKT",

"ABROM",

"ALEVEN",

"APERSONG",

"AGEZONG",

"AWAOREG",

"ABRAND",

"AZEILPL",

"APLEZIER",

"AFIETS",

"AINBOED",

"ABYSTAND",

"CARAVAN"]
    infile = 'tic2000-noheads-all.csv'
    outfile = 'ticdata2000.dat'
    fullData(infile, outfile, attrs)
