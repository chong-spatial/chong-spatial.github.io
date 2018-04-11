import json


        

def compress(transFile, outF, attrVals, attrMap):
    with open(transFile) as obsf, \
         open(outF, 'w') as outf:

        outf.write('var allObs =[')
        for o in obsf:
            outf.write('[')
            obs_lists = o.split(' ')
            obs_list = obs_lists[:-1]
            lab = obs_lists[-1]
            compressed_obs = []
            for i in obs_list:
                ori_attr_val = i.split('=')
                compressed_obs.append(attrMap[ori_attr_val[0]] + "=" + str(attrVals[ori_attr_val[0]].index(ori_attr_val[1]) + 1))
            outf.write(','.join("'"+x+"'" for x in compressed_obs))
            if "<" in lab:
                outf.write(',0],')
            else:
                outf.write(',1],')
            
        outf.write(']')
        outf.close()


if __name__ == "__main__":
    attrs = {"race": ["Other", "Asian-Pac-Islander", "White", "Black", "Amer-Indian-Eskimo"], "edu_num": ["8", "13", "5", "4", "12", "3", "16", "10", "9", "11", "15", "2", "1", "7", "6", "14"], "workclass": ["Self-emp-inc", "Self-emp-not-inc", "?", "Local-gov", "Without-pay", "State-gov", "Federal-gov", "Never-worked", "Private"], "relationship": ["Own-child", "Husband", "Not-in-family", "Other-relative", "Wife", "Unmarried"], "country": ["Canada", "Vietnam", "Cambodia", "Guatemala", "Outlying-US(Guam-USVI-etc)", "Trinadad&Tobago", "France", "Ecuador", "Philippines", "South", "Dominican-Republic", "Hong", "Jamaica", "England", "Laos", "Mexico", "Greece", "Italy", "Hungary", "Poland", "Iran", "Taiwan", "Germany", "El-Salvador", "?", "Columbia", "Puerto-Rico", "Cuba", "Nicaragua", "China", "Peru", "Ireland", "Honduras", "Haiti", "Thailand", "Portugal", "Japan", "United-States", "Holand-Netherlands", "Scotland", "India", "Yugoslavia"], "hours": ["too-many", "full-time", "half-time", "overtime"], "loss": ["medium", "small", "none"], "education": ["Assoc-acdm", "Bachelors", "9th", "Masters", "Some-college", "Assoc-voc", "7th-8th", "Doctorate", "Prof-school", "5th-6th", "10th", "1st-4th", "Preschool", "11th", "12th", "HS-grad"], "gain": ["high", "medium", "small", "none"], "sex": ["Female", "Male"], "marital": ["Never-married", "Married-civ-spouse", "Married-AF-spouse", "Married-spouse-absent", "Separated", "Widowed", "Divorced"], "occupation": ["Exec-managerial", "Craft-repair", "Other-service", "Adm-clerical", "Sales", "Armed-Forces", "?", "Prof-specialty", "Farming-fishing", "Transport-moving", "Machine-op-inspct", "Protective-serv", "Priv-house-serv", "Handlers-cleaners", "Tech-support"], "age": ["senior", "old", "young", "middle-aged"]}
    attrmap = {"age": "M", "race": "A", "gain": "I", "relationship": "D", "hours": "F", "country": "E", "marital": "K", "education": "H", "workclass": "C", "sex": "J", "loss": "G", "occupation": "L", "edu_num": "B"}
    compress("census.dat", "obs_census.js",attrs,attrmap)
