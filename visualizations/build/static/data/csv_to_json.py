"""

"""
import pandas as pd


def main():
    # read csv into datframe
    #df = pd.read_csv("GTD.csv", header=0, usecols=["iyear", "country_txt", "success", "attacktype1_txt", "targtype1_txt", "gname", "weaptype1_txt"])
    df = pd.read_csv("GTD.csv", header=0, usecols=["iyear", "country_txt", "nkill", "nwound"])
    # remove rows with empty cells
    df = df.dropna(axis=0)
    #df = df.rename(columns ={"iyear": 'year', "country_txt":'country', "attacktype1_txt":"attack_type", "targtype1_txt": "target_type", "weaptype1_txt": "weapon_type"})
    df = df.rename(columns ={"iyear": 'year', "country_txt":'country'})

    # make sure all groups (a group is filtered by country and year e.g.
    # all values with albania and 1995) have a sum that is bigger than 0
    #df["suicides_per_10000"] = df["population"]/10000
    #df["suicides_per_10000"] = df["suicides_no"]/df["suicides_per_10000"]

    #df["percentage_suicides"] = df["suicides_no"]/df["population"]*100
    grouped_df = df.groupby(by=["country", "year"], as_index=False).sum()
    #grouped_df = grouped_df[grouped_df['success']!=0]
    # get the sum of the groups:
    # note line 30 should be uncommented to make the pooledData json file
    #grouped_df = df.groupby(by=["country", "year", "attack_type"], as_index=False).sum()


    # get the sum of the groups:
    # note line 30 should be uncommented to make the pooledData json file
    # grouped_df = df.groupby(by=["country", "year"], as_index=False).sum()
    # transform df to json
    grouped_df.to_json(path_or_buf="nkill_and_nwound.json", orient="records")


if __name__ == '__main__':
    main()
