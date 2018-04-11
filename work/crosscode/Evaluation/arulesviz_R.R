library("arulesViz")
data("Groceries")
summary(Groceries)

rules <- apriori(Groceries, parameter=list(support=0.001, confidence=0.5))
rules
inspect(head(sort(rules, by ="lift"),3))

plot(rules)


sel <- plot(rules, measure=c("support", "lift"), shading="confidence", interactive=TRUE)
