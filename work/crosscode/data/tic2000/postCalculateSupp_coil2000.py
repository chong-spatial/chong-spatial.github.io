import csv
import psycopg2


def postCal(inFile, outFile):
     
    pg_database = 'tic2000'
    pg_user = 'postgres'
    pg_password = 'epauncc'
    pg_host = 'localhost'
    pg_port = '5432'
    pg_tablename = 'tic2000'

    totalcount = 9822
    totalcls1 = 586

    conn=psycopg2.connect(database=pg_database, user=pg_user, password=pg_password, host=pg_host, port=pg_port)
    cur=conn.cursor()
    
    with open(inFile) as inf, \
         open(outFile, 'w') as ouf:

        for l in inf:
            itemset_str = l.split('<-')[1]
            itemset_list_str = itemset_str.strip().split('(')
            if len(itemset_list_str[0]) != 0:
                itemsets = itemset_list_str[0].strip().split(',')
                measures = itemset_list_str[1][:-1].split(',')
                        
                
                itemsets_equlstr = [i.split('=')[0] + "='" + i.split('=')[1] \
                                    + "'" for i in itemsets]

                # cur.execute("SELECT count(*), avg({}) from {} where {}='{}' and {}".format(dim,bdtype,responseVar,ctrlLabel,' and '.join(i for i in conditem)))
                cur.execute("SELECT count(*) from {} where {}".format(pg_tablename,' and '.join(i for i in itemsets_equlstr)))
                row=cur.fetchone()

                if row is not None:
                    pa = 0 if row[0] is None else int(row[0])
                    pab = int(measures[0].split("/")[1])

                    newconf = round(pab / pa *100, 4) 
                    newsupp = round(pab / totalcount, 4)
                    
                    if newsupp >0.042 and newconf > 10:
                        ouf.write('CARAVAN=1 <- ' + ','.join(itemsets) + '(' + str(newsupp) \
                              + '/' + str(pab) + ', ' + str(newconf) + ', ' + str(float(measures[2])) + ')\n')          
                    
    conn.close()
    ouf.close()
    
   
                      
                

if __name__ == "__main__":
    
    infile = 'caravan1.txt'
    outfile = 'caravan1_new.txt'
    postCal(infile, outfile)
